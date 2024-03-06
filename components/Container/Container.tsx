import styles from "./Container.module.css";
import Auth from "../SelectTab/Auth";
import { Dispatch, SetStateAction } from "react";

type Props = {
  currentAccount: string | undefined;
  connectWallet: any;
  setCurrentAccount: Dispatch<SetStateAction<string | undefined>>;
};

export default function Container({
  currentAccount,
  connectWallet,
  setCurrentAccount,
}: Props) {
  return (
    <div className={styles.mainBody}>
      <div className={styles.centerContent}>
        <Auth
          currentAccount={currentAccount}
          connectWallet={connectWallet}
          setCurrentAccount={setCurrentAccount}
        />
      </div>
    </div>
  );
}
