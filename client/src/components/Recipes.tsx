import update from 'immutability-helper'
import React, { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router'
import { DataView, DataViewLayoutOptions } from 'primereact/dataview';
import { Button } from 'primereact/button';
import { createRecipe, deleteRecipe, getRecipes, patchRecipe } from '../api/RecipesApi'
import { Recipe } from '../types/Recipe'
import { useAuth0 } from '@auth0/auth0-react';
import { PrimeIcons } from 'primereact/api';
import { CreateRecipeRequest } from '../types/CreateRecipeRequest';
import { InputTextarea } from 'primereact/inputtextarea';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { Checkbox } from 'primereact/checkbox';
import { confirmDialog } from 'primereact/confirmdialog';
import { Toast } from 'primereact/toast';
import nProgress from 'nprogress';

export function Recipes() {
    let emptyRecipe: CreateRecipeRequest = {
        name: '',
        description: '',
        isFavourite: false
    };

    const [recipes, setRecipes] = useState<Recipe[]>([])
    const [loadingRecipes, setLoadingRecipes] = useState<boolean>(false)
    const [layout, setLayout] = useState('grid');
    const [recipeDialog, setRecipeDialog] = useState(false);
    const [recipeDetailsDialog, setRecipeDetailsDialog] = useState(false);
    const [recipe, setRecipe] = useState(emptyRecipe);
    const [savingRecipe, setSavingRecipe] = useState(false);
    const toast = useRef<Toast>(null);
    const [isEditing, setIsEditing] = useState(false)
    const [currentRecipeId, setCurrentRecipeId] = useState<string>('')
    const [sendingRequest, setSendingRequest] = useState(false)


    const navigate = useNavigate()
    const { getAccessTokenSilently } = useAuth0();

    const getAccessToken = async (): Promise<string> => {
        try {
            return await getAccessTokenSilently();

        } catch (error) {
            toast.current?.show({ severity: 'error', detail: "Couldn't authenticate your request" })
            throw error
        }
    }

    const openNew = () => {
        setIsEditing(false)
        setRecipe(emptyRecipe);
        setRecipeDialog(true);
    }

    const onEditButtonClicked = (recipeId: string) => {
        setCurrentRecipeId(recipeId)
        setIsEditing(true)
        setRecipe(recipes.find(recipe => recipe.recipeId === recipeId)!);
        setRecipeDialog(true);
    }

    const onShowDetailsClicked = (recipeId: string) => {
        setCurrentRecipeId(recipeId)
        setRecipe(recipes.find(recipe => recipe.recipeId === recipeId)!);
        setRecipeDetailsDialog(true);
    }

    const hideDialog = () => {
        setIsEditing(false)
        setRecipeDialog(false);
    }

    useEffect(() => {
        if (sendingRequest) {
            nProgress.start()
        } else {
            nProgress.done()
        }
    }, [sendingRequest])


    const onInputChange = (value: string | boolean, name: string) => {
        let _recipe = { ...recipe };
        switch (name) {
            case 'name':
                _recipe.name = value as string
                setRecipe(_recipe);
                break;

            case 'description':
                _recipe.description = value as string
                setRecipe(_recipe);
                break;
            case 'isFavourite':
                _recipe.isFavourite = value as boolean
                setRecipe(_recipe);
                break;

            default:
                break;
        }
    }



    const onUploadImageButtonClicked = (recipeId: string) => {
        navigate(`/recipes/${recipeId}/edit`)
    }

    const onRecipeCreate = async () => {

        try {
            setSavingRecipe(true)
            setSendingRequest(true)
            const accessToken = await getAccessToken();
            const newRecipe = await createRecipe(accessToken, {
                ...recipe
            })

            setRecipes([...recipes, newRecipe])
            toast.current?.show({ severity: 'success', summary: 'Recipe Added', detail: 'Recipe has been added successfully' });

            hideDialog()
        } catch {
            toast.current?.show({ severity: 'error', detail: 'Recipe creation failed' })
        } finally {
            setSavingRecipe(false)
            setSendingRequest(false)
        }

    }

    const onRecipeDelete = async (recipeId: string) => {

        confirmDialog({
            message: 'Are you sure you want to proceed?',
            header: 'Confirmation',
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
                try {
                    setSendingRequest(true)
                    const accessToken = await getAccessToken();

                    await deleteRecipe(accessToken, recipeId)
                    setRecipes(recipes.filter(recipe => recipe.recipeId !== recipeId))
                    toast.current?.show({ severity: 'info', summary: 'Recipe Deleted', detail: 'Recipe has been deleted successfully' });
                } catch {
                    toast.current?.show({ severity: 'error', detail: 'Recipe deletion failed' })
                } finally {
                    console.log("This run")
                    setSendingRequest(false)
                }
            },
        });

    }

    const onFavouriteToggle = async (recipeId: string) => {
        try {
            setSendingRequest(true)

            const accessToken = await getAccessToken();

            const pos = recipes.findIndex(recipe => recipe.recipeId === recipeId)
            const recipe = recipes[pos]

            await patchRecipe(accessToken, recipe.recipeId, {
                name: recipe.name,
                description: recipe.description,
                isFavourite: !recipe.isFavourite
            })

            toast.current?.show({ severity: `${!recipe.isFavourite ? 'success' : 'info'}`, detail: `Recipe ${!recipe.isFavourite ? 'Liked' : 'Disliked'}` });


            setRecipes(
                update(recipes, {
                    [pos]: { isFavourite: { $set: !recipe.isFavourite } }
                })
            )
        } catch {
            toast.current?.show({ severity: 'error', detail: 'Recipe update failed' })
        } finally {
            setSendingRequest(false)
        }
    }

    const onRecipeUpdate = async () => {
        try {
            setSavingRecipe(true)
            setSendingRequest(true)

            const accessToken = await getAccessToken();

            await patchRecipe(accessToken, currentRecipeId, {
                name: recipe.name,
                description: recipe.description,
                isFavourite: !recipe.isFavourite
            })

            toast.current?.show({ severity: "success", detail: 'Recipe has been updated' });
            hideDialog()
            fetchRecipes()
        } catch {
            toast.current?.show({ severity: 'error', detail: 'Recipe update failed' })
        } finally {
            setSavingRecipe(false)
            setSendingRequest(false)

        }
    }


    async function fetchRecipes() {
        const accessToken = await getAccessToken();

        setLoadingRecipes(true)
        try {
            const recipes = await getRecipes(accessToken)
            setRecipes(recipes)

            setLoadingRecipes(false)
        } catch (error) {
            setLoadingRecipes(false)
        }

    }


    useEffect(() => {
        fetchRecipes()

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])


    const renderActions = (recipe: Recipe) => {
        return < >
            <Button
                tooltip="View Details"
                tooltipOptions={{ position: 'bottom' }}
                icon={PrimeIcons.EYE}
                onClick={() => onShowDetailsClicked(recipe.recipeId)}
                className="p-button-rounded p-button-outlined p-button-success p-mr-2"
            />
            <Button
                tooltip={`${!recipe.isFavourite ? 'Like' : 'Dislike'}`}
                tooltipOptions={{ position: 'bottom' }}
                icon={recipe.isFavourite ? PrimeIcons.STAR_FILL : PrimeIcons.STAR}
                onClick={() => onFavouriteToggle(recipe.recipeId)}
                className={`p-button-rounded p-mr-2 ${!recipe.isFavourite ? 'p-button-outlined' : ''}`}
            />
            <Button
                tooltip="Upload Image"
                tooltipOptions={{ position: 'bottom' }}
                icon={PrimeIcons.IMAGE}
                onClick={() => onUploadImageButtonClicked(recipe.recipeId)}
                className="p-button-rounded p-button-outlined p-button-info p-mr-2"
            />

            <Button
                tooltip="Edit"
                tooltipOptions={{ position: 'bottom' }}
                icon={PrimeIcons.PENCIL}
                onClick={() => onEditButtonClicked(recipe.recipeId)}
                className="p-button-rounded p-button-outlined p-button-help p-mr-2"
            />

            <Button
                tooltip="Delete"
                tooltipOptions={{ position: 'bottom' }}
                icon={PrimeIcons.TRASH}
                onClick={() => onRecipeDelete(recipe.recipeId)}
                className="p-button-rounded  p-button-outlined p-button-danger"
            />
        </>
    }


    const renderListItem = (recipe: Recipe) => {
        return (
            <div className="p-col-12">
                <div className="recipe-list-item">
                    <img
                        src={recipe.attachmentUrl}
                        alt={recipe.name}
                        onError={(e) => e.currentTarget.src = "https://via.placeholder.com/300x200"} />
                    <div className="recipe-list-detail">
                        <div className="recipe-name">{recipe.name}</div>
                        <div className="recipe-description">{`${recipe.description.substring(0, 50)} ${recipe.description.length > 50 ? '...' : ''} `}</div>
                    </div>
                    <div className="p-d-flex p-jc-center">
                        {renderActions(recipe)}
                    </div>
                </div>
            </div>
        );
    }


    const renderGridItem = (recipe: Recipe) => {
        return (
            <div className="p-col-12 p-md-4">
                <div className="recipe-grid-item card">
                    <div className="recipe-grid-item-content">
                        <img
                            src={recipe.attachmentUrl}
                            alt={recipe.name}
                            onError={(e) => e.currentTarget.src = "https://via.placeholder.com/300x200"}
                        />
                        <div className="recipe-name">{recipe.name}</div>
                        <div className="recipe-description">{`${recipe.description.substring(0, 50)} ${recipe.description.length > 50 ? '...' : ''} `}</div>
                    </div>
                    <div className="p-d-flex p-jc-center">
                        {renderActions(recipe)}
                    </div>
                </div>
            </div>
        );
    }

    const itemTemplate = (recipe: Recipe, layout: string) => {
        if (!recipe) {
            return;
        }

        if (layout === 'list')
            return renderListItem(recipe);
        else if (layout === 'grid')
            return renderGridItem(recipe);
    }

    const renderHeader = () => {
        return (
            <div className="p-grid p-nogutter">
                <div className="p-col-12" style={{ textAlign: 'right' }}>
                    <Button className="p-button-sm p-mr-2" loading={loadingRecipes} onClick={() => fetchRecipes()} tooltip="Reload" icon={PrimeIcons.REFRESH} tooltipOptions={{ position: 'left' }} />
                    <DataViewLayoutOptions className="p-d-inline" layout={layout} onChange={(e) => setLayout(e.value)} />
                </div>
            </div>
        );
    }

    const recipeDialogFooter = (
        <React.Fragment>
            <Button label="Cancel" icon="pi pi-times" className="p-button p-button-sm p-button-outlined" onClick={hideDialog} disabled={savingRecipe} />
            <Button label="Save" icon="pi pi-check" className="p-button p-button-sm" loading={savingRecipe} disabled={!recipe.name || !recipe.description} onClick={() => isEditing ? onRecipeUpdate() : onRecipeCreate()} />
        </React.Fragment>
    );

    const header = renderHeader();


    return (
        <div className="dataview-demo">
            {/* {sendingRequest && <ProgressBar mode="indeterminate" style={{ height: 5, position: 'fixed', top: 0, zIndex: 2 }} />} */}

            <Toast ref={toast} />

            <div className="card">
                <DataView dataKey="recipeId" value={recipes} layout={layout} header={header}
                    itemTemplate={itemTemplate} paginator paginatorPosition={'both'}
                    rows={6} loading={loadingRecipes} emptyMessage="No recipe available" />
            </div>

            <div>
                <Button style={{
                    position: 'fixed',
                    bottom: 100,
                    right: 20
                }}
                    onClick={openNew}
                    icon={PrimeIcons.PLUS}
                    label="Add Recipe" className="p-button-rounded" />

            </div>

            <Dialog
                visible={recipeDialog}
                style={{ width: '450px' }}
                header={`${isEditing ? 'Edit ' + recipe.name : 'Add new Recipe'}`}
                modal className="p-fluid"
                closable={!savingRecipe}
                footer={recipeDialogFooter}
                onHide={hideDialog}>
                <div className="p-field">
                    <label htmlFor="name">Name *</label>
                    <InputText id="name" value={recipe.name} onChange={(e) => onInputChange(e.target.value, 'name')} required autoFocus />
                </div>
                <div className="p-field mt-4">
                    <label htmlFor="description">Description *</label>
                    <InputTextarea id="description" value={recipe.description} onChange={(e) => onInputChange(e.target.value, 'description')} required rows={3} cols={20} />
                </div>
                <div className="p-field-checkbox mt-4">
                    <Checkbox inputId="isFavourite" value={recipe.isFavourite} onChange={(e) => (onInputChange(e.target.checked, 'isFavourite'))} checked={recipe.isFavourite} />
                    <label htmlFor="isFavourite">Is Favourite</label>
                </div>
            </Dialog>
            <Dialog
                visible={recipeDetailsDialog}
                style={{ width: '40vw' }}
                header={recipe.name}
                modal className="p-fluid"
                onHide={() => setRecipeDetailsDialog(false)}>
                <div className="p-col-12">
                    {recipe.description}
                </div>
            </Dialog>

        </div>
    );



}

