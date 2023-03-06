import React from "react";

import { deleteFile } from "../../../services/FileuploadService";

import {
  Button,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
  useDisclosure,
} from '@chakra-ui/react'


function AlertDialogExample(rowToDelete) {

    const { isOpen, onOpen, onClose } = useDisclosure()
    const cancelRef = React.useRef()

    console.log('rowToDeletevalue', rowToDelete)

    const deleteButton = (rowName) => {
      console.log(rowName);
      return deleteFile(rowName).then((response) => {
        setMessage(response.data);
      }).catch((error) => {
        console.log(error);
      })
      // .then(() => {
      //   getFiles().then((response) => {
      //     setFileInfos(response.data);
      //   });
      // }
      // );
    }


  
    return (
      <>
        
        <AlertDialog
          isOpen={isOpen}
          leastDestructiveRef={cancelRef}
          onClose={onClose}
        >
          <AlertDialogOverlay>
            <AlertDialogContent>
              <AlertDialogHeader fontSize='lg' fontWeight='bold'>
                Delete Data
              </AlertDialogHeader>
  
              <AlertDialogBody>
                Are you sure? File to delete: {rowToDelete}
              </AlertDialogBody>
  
              <AlertDialogFooter>
                <Button ref={cancelRef} onClick={onClose}>
                  Cancel
                </Button>
                <Button colorScheme='red' onClick={() => deleteButton(rowToDelete)} ml={3}>
                  Delete
                </Button>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialogOverlay>
        </AlertDialog>
      </>
    )
  }

export default AlertDialogExample;