import * as React from 'react'

interface NotFoundProps {
}

interface NotFoundState {
}

export class NotFound extends React.PureComponent<NotFoundProps, NotFoundState> {
  render() {
    return <h1 className="p-text-center p-mt-6">Not Found</h1>
  }
}
