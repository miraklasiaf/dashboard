import { getLayout } from '@/layouts/dashboard';

import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db, logout } from "../firebase/firebase";
import { query, collection, getDocs, where } from "firebase/firestore";

import Router from 'next/router'


// const DashboardIndex = () => <div>this is dashboard page</div>;
// DashboardIndex.getLayout = getLayout;
// export default DashboardIndex;

function Dashboard() {
    const [user, loading, error] = useAuthState(auth);
    const [name, setName] = useState("");

    const fetchUserName = async () => {
        try {
          const q = query(collection(db, "users"), where("uid", "==", user?.uid));
          const doc = await getDocs(q);
          const data = doc.docs[0].data();
          setName(data.name);
        } catch (err) {
          console.error(err);
          // alert("An error occured while fetching user data");
        }
      };

      useEffect(() => {
        if (loading) return;
        if (!user) {Router.push('/connect/login')};
        fetchUserName();
      }, [user, loading]);

      return (
        <div className="dashboard">
          <div className="dashboard__container">
            Logged in as
            <div>{name}</div>
            <div>{user?.email}</div>
            <button className="dashboard__btn" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      );
    }

Dashboard.getLayout = getLayout;
export default Dashboard;