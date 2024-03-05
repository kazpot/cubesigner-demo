import styles from "./Container.module.css";
import Auth from "../SelectTab/Auth";

type Props = {
  currentAccount: string | undefined;
  connectWallet: any;
};

export default function Container({ currentAccount, connectWallet }: Props) {
  return (
    <div className={styles.mainBody}>
      <div className={styles.centerContent}>
        <Auth currentAccount={currentAccount} connectWallet={connectWallet} />
      </div>
    </div>
  );
}
