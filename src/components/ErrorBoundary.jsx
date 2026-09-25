import { Component } from 'react'

// A render error anywhere below this boundary is caught here instead of
// blanking the whole page.
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
    this.handleRetry = this.handleRetry.bind(this)
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Unexpected error in the todo app:', error, errorInfo)
  }

  handleRetry() {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state

    if (error) {
      return (
        <div className="app error-boundary" role="alert">
          <h1>Something went wrong</h1>
          <p>The todo list could not be displayed.</p>
          <button type="button" onClick={this.handleRetry}>
            Try again
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
