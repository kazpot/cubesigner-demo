import type { NextPage } from "next";
import Container from "../components/Container/Container";
import { useWallet } from "../hooks/useWallet";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const { currentAccount, connectWallet } = useWallet();

  return (
    <div className={styles.pageBody}>
      <div className={styles.navBar}>
        <div className={styles.rightHeader}>
          <div className={styles.appName}> CubeSigner Demo </div>
        </div>
        {currentAccount !== undefined ? (
          <div className={styles.connected}>
            {"Connected to " + currentAccount}
          </div>
        ) : (
          ""
        )}
      </div>
      <Container
        currentAccount={currentAccount}
        connectWallet={connectWallet}
      />
    </div>
  );
};

export default Home;
