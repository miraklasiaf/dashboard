import { getLayout } from '@/layouts/dashboard';

import React, { useEffect } from "react";
import { useRouter } from 'next/router';
import { useAuthUserContext } from '../context/AuthUserContext';

import { Button } from '@chakra-ui/react'

function Dashboard() {

    const { authUser, loading, logOut } = useAuthUserContext();
    const Router = useRouter();

    useEffect(() => {
      if (loading) return;
      if (!authUser) {Router.push('/connect/login')};
    }, [authUser, loading]);

    const displayName = authUser?.uid;
    const displayEmail = authUser?.email;

    return (
      <div className="dashboard">
          <div> {displayName}</div>
          <div> {displayEmail}</div>
          <Button onClick={logOut} mt='10'> Logout </Button>
      </div>
    );

}

Dashboard.getLayout = getLayout;
export default Dashboard;