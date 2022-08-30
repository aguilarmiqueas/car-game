import styles from "./HUD.module.css";
import { useRef } from "react";
import { useGlobalStore } from "./useStore";
import { useEffect } from "react";
export function HUD() {
  const ref = useRef();
  const setHUDRef = useGlobalStore((state) => state.setHUDRef);
  let loaded = useGlobalStore((state) => state.loaded);
  useEffect(() => {
    setHUDRef(ref);
  }, []);
  return (
    loaded && (
      <div ref={ref} className={styles.HUDWrapper}>
        <div className={styles.boostWrapper}>
          <div className={styles.boostTitle}>BOOST</div>
          <div className={styles.boostBarWrap}>
            <div className={styles.boostBar}></div>
          </div>
        </div>
        <div className={styles.lapWrapper}>
          <div className={styles.currentLap}>00:00:00</div>
          <div className={styles.bestLap}>00:00:00</div>
        </div>
      </div>
    )
  );
}
