import styles from "./Loader.module.css";
export function Loader() {
  return (
    <div className={styles.bg}>
      <div className={styles.wrap}>
        <h1 className={styles.title}>{progress} Loaded</h1>
        <p className={styles.text}>This application is currently loading</p>
      </div>
    </div>
  );
}
