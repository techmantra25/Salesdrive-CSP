import React from 'react'
import { Button, Modal, Spinner } from "flowbite-react";
import { HiOutlineExclamationCircle } from "react-icons/hi";

const DeleteConfirmModal = ({ show, onClose, onConfirm, isDeleting, slabName }) => {
  return (
    <Modal show={show} onclose={onClose} size="md" popup>
        <Modal.Header/>
        <Modal.Body>
            <div className='text-center'>
                <HiOutlineExclamationCircle className="mx-auto mb-4 h-14 w-14 text-gray-400 dark:text-gray-200" />
                <h3 className='mb-5 text-lg font-normal text-gray-500 dark:text=gray-400 '>
                    Are you sure you want to delete this slab?
                </h3>
                {slabName && (
                    <p className='mb-5 text-sm font-semibold text-gray-700 dark:text-gray-300'>
                        "{slabName}"
                    </p>
                )}
                <div className='flex justify-center gap-4'>
                    <Button
                    color ="failure"
                    onClick={onConfirm}
                    disabled={isDeleting}
                    >
                        {isDeleting && <Spinner className='mr-2' size="sm"/>}
                        {isDeleting ? "Deleting..." : "Yes, I'm sure"}
                    
                    </Button>
                    <Button color="gray" onClick={onClose} disabled={isDeleting}>
                        No, cancel
                    </Button>
                </div>
            </div>
        </Modal.Body>

    </Modal>
  )
}

export default DeleteConfirmModal