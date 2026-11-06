import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, Route, Routes } from 'react-router'
import { expect, it } from 'vitest'
import { saveSession } from '../../api/session'
import { jsonResponse, routeFetch } from '../../test/fetch'
import { makePost } from '../../test/posts'
import NewPostPage from './NewPostPage'

function renderPage() {
  render(
    <MemoryRouter initialEntries={['/publicar']}>
      <Routes>
        <Route path="/publicar" element={<NewPostPage />} />
        <Route path="/posts/:id" element={<h1>Detalhe do post</h1>} />
        <Route path="/" element={<h1>Feed</h1>} />
      </Routes>
    </MemoryRouter>,
  )
}

it('publica o post e abre o detalhe', async () => {
  const user = userEvent.setup()
  saveSession('jwt-token', 3600, false)
  const created = makePost({ title: 'React zero to hero' })
  const fetchMock = routeFetch({ 'POST /api/posts': () => jsonResponse(201, created) })
  renderPage()

  await user.type(screen.getByLabelText('Nome do projeto'), 'React zero to hero')
  await user.type(screen.getByLabelText('Descrição'), 'Projeto para praticar hooks.')
  await user.type(screen.getByLabelText('Tags'), 'React{enter}')
  await user.click(screen.getByRole('button', { name: 'Publicar' }))

  expect(await screen.findByRole('heading', { name: 'Detalhe do post' })).toBeInTheDocument()
  const [request] = fetchMock.mock.calls[0]
  expect(request.headers.get('Authorization')).toBe('Bearer jwt-token')
  expect(await request.json()).toEqual({ title: 'React zero to hero', body: 'Projeto para praticar hooks.', tags: ['React'] })
})

it('volta ao feed ao descartar', async () => {
  renderPage()
  await userEvent.click(screen.getByRole('button', { name: 'Descartar' }))
  expect(screen.getByRole('heading', { name: 'Feed' })).toBeInTheDocument()
})
