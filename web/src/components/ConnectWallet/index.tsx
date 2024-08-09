import React, { useCallback } from "react";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { useWeb3Modal, useWeb3ModalState } from "@web3modal/wagmi/react";
import { Button } from "@kleros/ui-components-library";
import { SUPPORTED_CHAINS, DEFAULT_CHAIN } from "consts/chains";
import AccountDisplay from "./AccountDisplay";

export const SwitchChainButton: React.FC<{ className?: string }> = ({ className }) => {
  const { switchChain, isPending } = useSwitchChain();
  const handleSwitch = useCallback(() => {
    if (!switchChain) {
      console.error("Cannot switch network. Please do it manually.");
      return;
    }
    try {
      switchChain({ chainId: DEFAULT_CHAIN });
    } catch (err) {
      console.error(err);
    }
  }, [switchChain]);
  return (
    <Button
      {...{ className }}
      isLoading={isPending}
      disabled={isPending}
      text={`Switch to ${SUPPORTED_CHAINS[DEFAULT_CHAIN].name}`}
      onClick={handleSwitch}
    />
  );
};


const ConnectButton: React.FC<{ className?: string }> = ({ className }) => {
  const { open } = useWeb3Modal();
  const { open: isOpen } = useWeb3ModalState();
  return (
    <Button
      {...{ className }}
      disabled={isOpen}
      small
      text={"Connect"}
      onClick={async () => open({ view: "Connect" })}
    />
  );
};

const ConnectWallet: React.FC<{ className?: string }> = ({ className }) => {
  const chainId = useChainId();
  const { isConnected } = useAccount();
  if (isConnected) {
    if (chainId !== DEFAULT_CHAIN) {
      return <SwitchChainButton {...{ className }} />;
    } else return <AccountDisplay />;
  } else return <ConnectButton {...{ className }} />;
};

export default ConnectWallet;
