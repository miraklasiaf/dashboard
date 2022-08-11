import React, { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase/firebase";
import Router from 'next/router'
import { getLayout } from '@/layouts/dashboard';

import { useForm } from "react-hook-form";
import { FileUpload } from "../../components/upload-form";

import { SimpleGrid } from '@chakra-ui/react'


function Upload() {
    const [user, loading, error] = useAuthState(auth);
    const {
		handleSubmit,
		register,
		setError,
		control,
		formState: { errors, isSubmitting },
	} = useForm()

    useEffect(() => {
        if (loading) return;
        if (!user) {Router.push('/connect/login')};
      }, [user, loading]);

      return (
        <div>
            <SimpleGrid minChildWidth='250px' spacing={8}>

                <FileUpload name="avatar"
                            acceptedFileTypes="image/*"
                            isRequired={true}
                            placeholder="face.jpg"
                            control={control}>
                    New image
                </FileUpload>

                <FileUpload name="avatar"
                            acceptedFileTypes="image/*"
                            isRequired={true}
                            placeholder="voice.wav"
                            control={control}>
                    New image
                </FileUpload>

            </SimpleGrid>

        </div>
      );
    }

Upload.getLayout = getLayout;
export default Upload;