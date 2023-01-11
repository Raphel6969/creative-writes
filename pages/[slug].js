import Message from "../components/Message"
import { useRouter } from "next/router"
import { useEffect } from "react"
import { useState } from "react"
import { auth } from "../utils/firebase"
import { db } from "../utils/firebase"
import 'react-toastify/dist/ReactToastify.css'
import { toast } from "react-toastify";
import { arrayUnion, doc, getDoc, onSnapshot, Timestamp, updateDoc } from "firebase/firestore"

export default function Details(){
    const router = useRouter();
    const routeData = router.query;
    const [message, setMessage] =  useState("")
    const [allMessages, setAllMessages] = useState([]) 


    //Submit a msg
    const submitMessage = async() =>{
        //Check if the user is logged 
        if(!auth.currentUser) router.push("/auth/login")

        if(!message){
            toast.error("Dont leave an empty message 😅", {
                position: toast.POSITION.TOP_CENTER,
                autoClose: 1500,
            })
            return;
        }
        const docRef = doc(db, 'posts', routeData.id)
        await updateDoc(docRef, {
            comments: arrayUnion({
                message,
                avatar:auth.currentUser.photoURL,
                userName: auth.currentUser.displayName,
                time: Timestamp.now()
            }),
        })

        setMessage("")
    }

    //Get Comments
    const getComments = async() =>{
        const docRef = doc(db, 'posts', routeData.id)
        const unsubscribe = onSnapshot(docRef, (snapshot) => {
            setAllMessages(snapshot.data().comments)
        })
        return unsubscribe;
    }

    useEffect(()=>{
        if(!router.isReady) return;
        getComments()
    },[router.isReady])

    return(
        <div>
            <Message {...routeData}>

            </Message>
            <div className="my-4">
                <div className="flex">
                <input className="bg-gray-800 w-full p-2 text-white text-sm"  type="text" value={message} placeholder="Send a message 😁" onChange={(e) =>setMessage(e.target.value)}/>
                <button onClick={submitMessage} className="bg-cyan-500 text-white text-sm p-2">submit</button>
                </div>

                <div className="py-6">
                    <h2 className="font-bold">Comments</h2>
                    {allMessages?.map((message)=>(
                        <div className="bg-white p-4 my-4 border-2 " key={message.time}>
                            <div className="flex items-center gap-2 mb-4 ">
                                <img className="w-10 rounded-full" src={message.avatar} />
                                <h2 >{message.userName}</h2>

                            </div>
                            <h2>{message.message}</h2>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}