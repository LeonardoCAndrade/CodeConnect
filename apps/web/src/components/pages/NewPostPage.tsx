import { useNavigate } from 'react-router'
import { createPost } from '../../api/posts'
import PostForm from '../organisms/PostForm'
import type { PostFormValues } from '../organisms/PostForm'

function NewPostPage() {
  const navigate = useNavigate()

  async function publish(values: PostFormValues) {
    const post = await createPost(values)
    navigate(`/posts/${post.id}`)
  }

  return (
    <>
      <title>Publicar | CodeConnect</title>
      <PostForm onSubmit={publish} onDiscard={() => navigate('/')} />
    </>
  )
}

export default NewPostPage
