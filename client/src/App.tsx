import React from 'react';
import './App.scss';
import { Navigate, Outlet, useLocation, useNavigate } from 'react-router';
import { Link, Route, Routes } from 'react-router-dom';
import PrimeReact, { PrimeIcons } from 'primereact/api';
import { LogIn } from './components/LogIn';
import { Recipes } from './components/Recipes';
import { EditRecipe } from './components/EditRecipe';
import { Menubar } from 'primereact/menubar';

import { Button } from 'primereact/button';
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { ProgressSpinner } from 'primereact/progressspinner';
import { authConfig } from './config';
import { NotFound } from './components/NotFound';

PrimeReact.ripple = true;


function App() {
  return (
    <Auth0Provider
      domain={authConfig.domain}
      clientId={authConfig.clientId}
      redirectUri={window.location.origin}
      audience="https://nakjemmy.eu.auth0.com/api/v2/"
      scope="read:current_user"
    >
      <Routes>
        <Route element={<Layout />}>
          <Route
            path="/"
            element={
              <RequireAuth>
                <Recipes />
              </RequireAuth>
            }
          />
          <Route
            path="/recipes/:recipeId/edit"
            element={
              <RequireAuth>
                <EditRecipe />
              </RequireAuth>
            }
          />
          <Route path="/login" element={<LogIn />} />
          <Route path="*" element={<NotFound />} />

        </Route>
      </Routes>
    </Auth0Provider>
  );
}


function Layout() {
  return (
    <div>
      <LayoutToolbar />
      <Outlet />
    </div>
  );
}

const LayoutToolbar = () => {
  const { isAuthenticated, logout } = useAuth0()
  const navigate = useNavigate()

  const leftContents = (
    <React.Fragment>
      <h2><Link style={{ textDecoration: 'none' }} to="/">Recipe App</Link></h2>
    </React.Fragment>
  );

  const rightContents = (
    <React.Fragment>
      {isAuthenticated && <>
        <Button icon={PrimeIcons.HOME} onClick={() => navigate('/')} label="Home" className="p-button-primary p-mr-2" />
        <Button icon={PrimeIcons.SIGN_OUT} onClick={() => logout({ returnTo: window.location.origin })} label="Logout" className="p-button-danger" />
      </>}
    </React.Fragment>
  );

  return (
    <div className="card">
      <Menubar start={leftContents} end={rightContents} />
    </div>
  );
}


function RequireAuth({ children }: { children: JSX.Element }) {
  let { isAuthenticated, isLoading } = useAuth0();
  let location = useLocation();

  if (isLoading) {
    return <div>
      <div className="p-d-flex p-jc-center" style={{ paddingTop: '35vh' }}>
        <ProgressSpinner style={{ width: 50 }} />
      </div>
    </div>;
  }


  if (!isAuthenticated) {
    // Redirect them to the /login page, but save the current location they were
    // trying to go to when they were redirected. This allows us to send them
    // along to that page after they login, which is a nicer user experience
    // than dropping them off on the home page.
    return <Navigate to="/login" state={{ from: location }} />;
  }

  return children;
}

export default App;
