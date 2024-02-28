import React, { useState } from 'react';
import PopupBase from '../../../components/PopupBase';

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
        <PopupBase showPopup={showPopup} title="Change Image" onClose={closePopup}>
            <div className="flex flex-col items-center space-y-4">
                {previewImage && (
                    <img src={previewImage} alt="Preview" className="w-64 h-64 object-cover rounded-lg shadow-lg" />
                )}
                <input type="file" onChange={changeFile} className="py-2 px-4 bg-gray-200 rounded-lg focus:outline-none" />
                <div className="flex space-x-4">
                    <button onClick={closePopup} className="py-2 px-4 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 focus:outline-none" >Cancel</button>
                    <button onClick={setNewFile} className="py-2 px-4 bg-black text-white rounded-lg hover:bg-blue-600 focus:outline-none" > Continue </button>
                </div>
            </div>
        </PopupBase>
    );
}
