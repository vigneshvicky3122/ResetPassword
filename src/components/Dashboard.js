import React, { useState, useEffect } from "react";
import Table from "react-bootstrap/Table";
import { useNavigate } from "react-router-dom";
import { url } from "../App";
import axios from "axios";
import Nav from "./Nav";
function Dashboard() {
  let navigate = useNavigate();
  const [Users, setUsers] = useState([]);

  useEffect(() => {
    getData();
  }, []);

  useEffect(() => {
    getData();
  }, []);
  async function getData() {
    try {
      let request = await axios.get(`${url}/dashboard`, {
        headers: {
          authorization: window.localStorage.getItem("app-token"),
          username: window.localStorage.getItem("username"),
        },
      });
      setUsers(request.data.users);

      if (request.data.statusCode === 400) {
        console.log(request.data.message);
        navigate("/accounts/login");
      }
      if (request.data.statusCode === 401) {
        console.log(request.data.message);
      }
      if (request.data.statusCode === 500) {
        console.log(request.data.message);
      }
    } catch (error) {
      console.log(error);
    }
  }

  return (
    <>
      <Nav />
      <div>
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>UserId</th>
              <th>Name</th>
              <th>Email</th>
              <th>Username</th>
              <th>Password</th>
            </tr>
          </thead>
          <tbody>
            {Users &&
              Users.map((e) => {
                return (
                  <tr key={e._id}>
                    <td>{e._id}</td>
                    <td>{e.name}</td>
                    <td>{e.email}</td>
                    <td>{e.username}</td>
                    <td>{e.password}</td>
                  </tr>
                );
              })}
          </tbody>
        </Table>
      </div>
    </>
  );
}

export default Dashboard;
