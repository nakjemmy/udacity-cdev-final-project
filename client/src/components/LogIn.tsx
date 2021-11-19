import { Button } from 'primereact/button'
import { Card } from 'primereact/card';
import { useState } from 'react'
import { PrimeIcons } from 'primereact/api';
import { useAuth0 } from '@auth0/auth0-react';

export const LogIn = () => {
  const { loginWithRedirect } = useAuth0()
  const [loggingIn, setLoggingIn] = useState(false);

  const login = () => {
    setLoggingIn(true)
    loginWithRedirect()
  }

  return (
    <div className="p-d-flex p-jc-center p-mt-4">
      <div className="p-col-8 p-md-3 text-center">
        <Card>
          <h2 className="p-text-center">Recipe App</h2>
          <h5 className="p-text-center">Your best Collections</h5>
          <div className="p-d-flex p-jc-center p-mt-5">
            <Button icon={PrimeIcons.SIGN_IN} loading={loggingIn} onClick={login} label="Login" />

          </div>
        </Card>
      </div>
    </div>
  )
}

