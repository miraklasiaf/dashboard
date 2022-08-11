import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/firebase";
import Router from 'next/router'
import { getLayout } from '@/layouts/dashboard';

function Calendar() {
    const [user, loading, error] = useAuthState(auth);

    useEffect(() => {
        if (loading) return;
        if (!user) {Router.push('/connect/login')};
      }, [user, loading]);

      return (
        <div>
            Logged in and viewing the calendar page ...
        </div>
      );
    }

Calendar.getLayout = getLayout;
export default Calendar;