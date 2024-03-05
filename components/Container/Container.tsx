import { useState } from "react";

import styles from "./Container.module.css";
import { useContract } from "@/hooks/useContract";
import Auth from "../SelectTab/Auth";

type Props = {
  currentAccount: string | undefined;
};

export default function Container({ currentAccount }: Props) {
  const [updateDetailsFlag, setUpdateDetailsFlag] = useState(0);
  const { usdc: token0, joe: token1, amm } = useContract(currentAccount);

  return (
    <div className={styles.mainBody}>
      <div className={styles.centerContent}>
        <Auth
          token0={token0}
          token1={token1}
          amm={amm}
          currentAccount={currentAccount}
        />
      </div>
    </div>
  );
}
