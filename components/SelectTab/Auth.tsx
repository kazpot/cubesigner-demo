import styles from "./Auth.module.css";

type Props = {
  currentAccount: string | undefined;
  connectWallet: any;
};

export default function Auth({ currentAccount, connectWallet }: Props) {
  return (
    <div className={styles.authBody}>
      {currentAccount === undefined ? (
        <div className={styles.bottomDiv}>
          <div className={styles.btn} onClick={() => ""}>
            Google
          </div>
        </div>
      ) : (
        ""
      )}
      {currentAccount === undefined ? (
        <div style={{ color: "white", textAlign: "center" }}>or</div>
      ) : (
        ""
      )}
      <div className={styles.bottomDiv}>
        {currentAccount === undefined ? (
          <div className={styles.btn} onClick={connectWallet}>
            Connect to wallet
          </div>
        ) : (
          <div className={styles.btn}>Connected</div>
        )}
      </div>
    </div>
  );
}
