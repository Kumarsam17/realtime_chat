import { useState,useEffect } from 'react';
import { Box, Button, Container, HStack, Input, VStack } from '@chakra-ui/react';
import Message from './components/Message';
import { onAuthStateChanged,getAuth, GoogleAuthProvider, signInWithPopup,signOut } from "firebase/auth";
import { app } from "./firebase";
import {getFirestore,addDoc, collection, serverTimestamp,onSnapshot} from "firebase/firestore";





const auth = getAuth(app);
const db = getFirestore(app);

const loginHandler = () => {
  const provider = new GoogleAuthProvider();
  signInWithPopup(auth, provider);
}


const logout = ()=>{
  signOut(auth)
}

function App() {

  const [user, setUser] = useState(false);
  const [message, setMessage] = useState("");

  const [messages, setMessages] =useState([]);

  //submit handler

  const submitHandler = async(e)=>{
    e.preventDefault();
    
    try{
      await addDoc(collection(db,"Messages"),{
        text:message,
        uid:user.uid,
        uri:user.photoURL,
        createdAt:serverTimestamp()
      });

      setMessage("");
    
    }catch (error){
      alert(error)
    
    }
    }

  useEffect(()=>{

    const unsubscribe= onAuthStateChanged(auth,(data)=>{
      setUser(data)
    });
    
    onSnapshot(collection(db,"Messages"),(snap)=>{
      setMessage(
        snap.docs.map((item)=>{
          const id =item.id;
          return {id,...item.data()}
        })
      )
    })
  
   

    return () =>{
      unsubscribe();
      
    }

  });

  return (
    <Box bg={"red.50"}>
      {
        user?(
          <Container bg={"white"} h={"100vh"}>
        <VStack h={"full"} paddingY={"4"} >
          <Button onClick={logout} w={"full"} colorScheme={"red"} >Logout</Button>
          <VStack h={'full'} w={"full"} padding="4" overflowY="auto">
            {messages.map(item=>(
              <Message 
              value={message}
              key={item.id}
              user={item.uri ===user.uid? "me" : "others"} 
              text={item.text} 
              uri={item.uri} />
            ))
            
            
              
            
            }

          </VStack>

          <form  onSubmit={submitHandler} style={{ width: "100%" }}>
            <HStack h={"100%"}>
              <Input  onChange={(e)=>setMessage(e.target.value)} placeholder='Enter a message' />
              <Button colorScheme={"purple"} type="submit">send</Button>

            </HStack>
          </form>

        </VStack>
      </Container>
        ): <VStack h={"100vh"} justifyContent={"center"} bg={"white"}>
          <Button onClick={loginHandler}>Sign In With Google </Button>
        </VStack>
      }
    </Box>
  )
}

export default App;
