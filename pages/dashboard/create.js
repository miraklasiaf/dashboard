import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/firebase";
import Router from 'next/router'
import { getLayout } from '@/layouts/dashboard';

function Team() {
    const [user, loading, error] = useAuthState(auth);

    useEffect(() => {
        if (loading) return;
        if (!user) {Router.push('/connect/login')};
      }, [user, loading]);

      return (
        <div>
            Create page
        </div>
      );
    }

Team.getLayout = getLayout;
export default Team;