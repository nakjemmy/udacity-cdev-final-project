import { useAuth0 } from '@auth0/auth0-react'
import { useEffect, useRef, useState } from 'react'
import { useParams } from 'react-router'
import { getUploadUrl, uploadFile } from '../api/RecipesApi'
import { FileUpload, FileUploadHandlerParam } from 'primereact/fileupload';
import { Toast } from 'primereact/toast'
import { ProgressBar } from 'primereact/progressbar';




export function EditRecipe() {
    const [uploadUrl, setUploadUrl] = useState<string>('')
    const { getAccessTokenSilently } = useAuth0()
    const { recipeId } = useParams()
    const toast = useRef<Toast>(null)
    const fileUploader = useRef<FileUpload>(null)
    const [uploading, setUploading] = useState(false)

    const getAccessToken = async (): Promise<string> => {
        try {
            return await getAccessTokenSilently();

        } catch (error) {
            alert("Couldn't authenticate your request")
            throw error
        }
    }

    const fetchUploadUrl = async () => {
        try {
            const accessToken = await getAccessToken();

            const url = await getUploadUrl(accessToken, recipeId!)

            setUploadUrl(url)

        } catch (e) {
            alert('Could not fetch upload url' + e)
        }
    }

    const onCustomUpload = async (fileUploadHandlerParam: FileUploadHandlerParam) => {
        let file = fileUploadHandlerParam.files[0]

        try {
            setUploading(true)
            await uploadFile(uploadUrl, file)
            fileUploader.current?.clear()
            onUpload()
        } catch (error) {
            toast.current?.show({ severity: 'error', summary: 'Image Upload Failed', detail: 'An error occurred while uploading image for recipe' });
        } finally {
            setUploading(false)
        }
    }


    const onUpload = () => {
        toast.current?.show({ severity: 'success', summary: 'Image Uploaded', detail: 'Image for recipe has been uploaded successfully' });
    }

    useEffect(() => {
        fetchUploadUrl()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <div className="p-p-4">
            {uploading && <ProgressBar mode="indeterminate" style={{ height: 5 }} />}

            <Toast ref={toast} />
            <h3>Upload image for Recipe</h3>

            <FileUpload ref={fileUploader} accept="image/*" url={uploadUrl} customUpload uploadHandler={onCustomUpload} />


            {/* {renderButton()} */}
        </div>
    )
}

