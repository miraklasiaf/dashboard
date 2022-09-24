import React, { useEffect, useState } from "react";
import { useRouter } from 'next/router';
import { useAuthUserContext } from '../../../../context/AuthUserContext';
import { getLayout } from '@/layouts/dashboard';
import { Button } from "@chakra-ui/react";


function VoiceSimple() {
  const { authUser, loading } = useAuthUserContext();
  const Router = useRouter();
  const [simpleList, setSimpleList] = useState(null);

  useEffect(() => {
    if (loading) return;
    if (!authUser) {Router.push('/connect/login')};
  }, [authUser, loading]);

  const retrieveSimple = async () => {
    const simpleData = await fetch('https://server.appliedhealthinformatics.com/sentances/list/random/5')
    .then(response => response.json())
    // catch error
    .catch(error => console.log(error))
    .then(data => {
      console.log('data retrieved: ', data);
      setSimpleList(data);
    });
  }

  return (
    <div>

        <Button mb='5' onClick={retrieveSimple}>
                    retrieve sample list
        </Button>


      {simpleList && (
        <table>
          <thead>
            <tr>
              <th>id</th>
              <th>sentance</th>
              <th>audio</th>
            </tr>
          </thead>
          <tbody>
            {simpleList && simpleList.map((item, index) => (
              <tr key={index}>
                <td>{item.senId}</td>
                <td>{item.sentance}</td>
                <td> will go here ...</td>
              </tr>
            ))}
          </tbody>
        </table>
        )
      }


    </div>
  );
}

VoiceSimple.getLayout = getLayout;
export default VoiceSimple;