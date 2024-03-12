import React, { useState } from 'react';
import ConfirmationPopup from '../../../components/Popups/ConfirmationPopup';

export default function ChangeImagePopup({ showPopup, closePopup, setNewImage }) {
    const [uploadedFile, setUploadedFile] = useState(null);
    const [previewImage, setPreviewImage] = useState(null);

    const changeFile = (e) => {
        const file = e.target.files[0];
        setUploadedFile(file);
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewImage(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const setNewFile = async () => {
        setNewImage(uploadedFile);
        setUploadedFile(null)
        setPreviewImage(null)
        closePopup();
    };

    return (
        <ConfirmationPopup
        showPopup={showPopup}
        closePopup={closePopup}
        confirm={setNewFile}
        >
            <div >
                {previewImage && (
                    <img src={previewImage} alt="Preview" className="w-64 h-64 object-cover rounded-lg shadow-lg" />
                )}
                <input type="file" onChange={changeFile}  />
            </div>

        </ConfirmationPopup>
        
    );
}