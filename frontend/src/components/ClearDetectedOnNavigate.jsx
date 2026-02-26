import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useHistory } from "../context/HistoryContext";

export default function ClearDetectedOnNavigate() {
  const location = useLocation();
  const { setDetected } = useHistory();
  const prevPath = useRef(location.pathname);

  useEffect(() => {
    if (prevPath.current !== location.pathname) {
      setDetected(null);
      prevPath.current = location.pathname;
    }
  }, [location.pathname, setDetected]);

  return null;
}
