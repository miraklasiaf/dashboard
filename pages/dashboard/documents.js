import React, { useEffect } from "react";
import { useRouter } from 'next/router';
import { useAuthUserContext } from '../../context/AuthUserContext';
import { getLayout } from '@/layouts/dashboard';

function Documents() {
  const { authUser, loading } = useAuthUserContext();
  const Router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!authUser) {Router.push('/connect/login')};
  }, [authUser, loading]);

  return (
    <div>
        Logged in and viewing the documents page ...
    </div>
  );
}

Documents.getLayout = getLayout;
export default Documents;