import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import PostForm from './PostForm'

function renderForm(onSubmit = vi.fn().mockResolvedValue(undefined)) {
  const onDiscard = vi.fn()
  render(<PostForm onSubmit={onSubmit} onDiscard={onDiscard} />)
  return { onSubmit, onDiscard }
}

it('valida os campos obrigatórios e a URL da imagem', async () => {
  const { onSubmit } = renderForm()
  await userEvent.type(screen.getByLabelText('URL da imagem (opcional)'), 'javascript:alert(1)')
  await userEvent.click(screen.getByRole('button', { name: 'Publicar' }))

  expect(screen.getByText('Informe o nome do projeto.')).toBeInTheDocument()
  expect(screen.getByText('Informe a descrição.')).toBeInTheDocument()
  expect(screen.getByText('Informe uma URL http ou https.')).toBeInTheDocument()
  expect(onSubmit).not.toHaveBeenCalled()
})

it('publica com imagem, código e tags, mostrando a prévia da imagem', async () => {
  const { onSubmit } = renderForm()
  expect(screen.getByRole('heading', { name: 'Novo projeto' })).toBeInTheDocument()
  expect(screen.getByRole('img', { name: /imagem indisponível/ })).toBeInTheDocument()

  await userEvent.type(screen.getByLabelText('URL da imagem (opcional)'), 'https://example.com/capa.png')
  expect(screen.getByRole('img', { name: 'Pré-visualização da imagem do projeto' })).toHaveAttribute('src', 'https://example.com/capa.png')

  await userEvent.type(screen.getByLabelText('Nome do projeto'), 'React zero to hero')
  await userEvent.type(screen.getByLabelText('Descrição'), 'Projeto para praticar hooks.')
  await userEvent.type(screen.getByLabelText('Código (opcional)'), 'const a = 1')
  const tagInput = screen.getByLabelText('Tags')
  await userEvent.type(tagInput, 'React{enter}Front-end{enter}react{enter}')
  const tags = screen.getByRole('list', { name: 'Tags do projeto' })
  expect(within(tags).getAllByRole('listitem')).toHaveLength(2)
  await userEvent.click(within(tags).getByRole('button', { name: 'Remover Front-end' }))

  await userEvent.click(screen.getByRole('button', { name: 'Publicar' }))
  expect(onSubmit).toHaveBeenCalledWith({
    title: 'React zero to hero',
    body: 'Projeto para praticar hooks.',
    code: 'const a = 1',
    imageUrl: 'https://example.com/capa.png',
    tags: ['React'],
  })
})

it('mostra o erro da API e permite descartar', async () => {
  const { onDiscard } = renderForm(vi.fn().mockRejectedValue(new Error('Dados inválidos.')))
  await userEvent.type(screen.getByLabelText('Nome do projeto'), 'Projeto')
  await userEvent.type(screen.getByLabelText('Descrição'), 'Descrição')
  await userEvent.click(screen.getByRole('button', { name: 'Publicar' }))
  expect(await screen.findByRole('status')).toHaveTextContent('Dados inválidos.')

  await userEvent.click(screen.getByRole('button', { name: 'Descartar' }))
  expect(onDiscard).toHaveBeenCalledOnce()
})
