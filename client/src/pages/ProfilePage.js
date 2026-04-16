import { useEffect, useState } from "react";

function ProfilePage() {
    const [userData, setUserData] = useState('')

    useEffect(() => {
        fetch('http://localhost:8000/profile', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(res => res.json())    
        .then(data => {setUserData(data)
            console.log(data)
        })    
    }, [])

    return (
        <div>
            <h1>{userData?.userInfo?.username}</h1>
            <p>Balance: {userData?.userInfo?.balance}</p>
        </div>
    )
}

export default ProfilePage;