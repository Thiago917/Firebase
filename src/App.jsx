import React, { useEffect, useState } from 'react'
import { db, storage } from './firebase'
import { addDoc, collection, deleteDoc, doc, getDocs, query, serverTimestamp, updateDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytesResumable } from 'firebase/storage'

const App = () => {

  const intialState = {
    nome: '',
    email: '',
    info: '',
    contact: '',
  }

  const userCollectionRef = collection(db, 'Skate-shop')

  const [users, setUsers] = useState(intialState)

  const [ file, setFile ] = useState(null)

  const [ progress, setProgress ] = useState(null)

  const [data, setData ] = useState(null)

  const [ isSubmit, setIsSubmit ] = useState(false)

  const [ images, setImages ] = useState([])
  
  
  useEffect(() => {
    const uploadFile = () => {
      const name = new Date().getTime() + file.name
      const storageRef = ref(storage, `images/${file.name}`)
      const uploadTask = uploadBytesResumable(storageRef, file)

      uploadTask.on('state_changed', (snapshot) => {
        const progress =
        (snapshot.bytesTransferred  / snapshot.totalBytes) * 100
        setProgress(progress)
        switch (snapshot.state) {
          case 'paused' :
            console.log('upload is paused')
          break

          case 'running' :
            console.log('upload is running')
          break;

          case 'ready' :
            console.log('upload has finished')
          default:
            break;
        }
      }, (error) => {
        console.log(error)
      }, () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          setData((prev) => ({ ...prev, imagem : downloadURL}))
        })
      }
      )
    }
    file && uploadFile()
  }, [file])


  useEffect(() => {
    const getUsers = async () => {
      const data = await getDocs(userCollectionRef)
      setImages(data.docs.map((doc) => ({ ...doc.data(), id : doc.id})))
    }
    getUsers()
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmit(true) 

    await addDoc(collection(db, 'Skate-shop'),{
      ...data,
      timestamp: serverTimestamp(),
    })
  }

  const deleteImage = async (id) => {
    const userDoc = doc(db , "Skate-shop", id);
     const del = await deleteDoc(userDoc)
  }


  return (
    <>
    <form action="" onSubmit={handleSubmit}>
      <input type="file"  onChange={(e) => setFile(e.target.files[0])} />
      <button type='submit' disable={progress !== null && progress < 100}>enviar</button>
    </form>
    {images && images.map((img) => {
      return(
        <>
        <img src={img.imagem} alt="" />
        <button onClick={() => deleteImage(img.id)}>DELETAR</button>

        </>
      )
    })}
    </>

  )
  }
export default App