import styles from "./Loader.module.css";
import gsap from "gsap";
import { useEffect, useRef } from "react";

export function Loader({ loaded }) {
  const ref = useRef();
  useEffect(() => {
    if (loaded) {
      gsap.to(ref.current, { opacity: 0 });
    }
  }, [loaded]);
  return (
    <div ref={ref} className={styles.bg}>
      <div className={styles.wrap}>
        <h1 className={styles.title}>Loading</h1>
        <p className={styles.text}>Currently loading</p>
      </div>
    </div>
  );
}
