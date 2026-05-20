import { useEffect, useState } from "react";
import api from "../../axios";

export default function Profile() {

  const [user, setUser] = useState(null);

  useEffect(() => {

    const getUser = async () => {
      try {
        const res = await api.get("/user");
        setUser(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    
    const getUserPermission = async () => {
      try {
        const res = await api.get("/set-permission");
        console.log(res.data);
      } catch (err) {
        console.log(err);
      }
    };

    getUser();
    getUserPermission();

  }, []);

  if (!user) {
    return <h2>Not logged in</h2>;
  }

  return (
    <div>
      <h1>Profile</h1>

      <p>Name: {user.first_name}</p>
      <p>Email: {user.email}</p>
    </div>
  );
}