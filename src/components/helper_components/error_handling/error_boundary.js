import React from "react";
import { ErrorFallback } from "./error_fallback";
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      info: null,
    };
  }
  componentDidCatch(error, info) {
    this.setState({
      hasError: true,
      error: error,
      info: info,
    });
  }
  render() {
    if (this.state.hasError) {
      return <ErrorFallback slug="something_went_wrong" />;
    }
    return this.props.children;
  }
}
export default ErrorBoundary;
