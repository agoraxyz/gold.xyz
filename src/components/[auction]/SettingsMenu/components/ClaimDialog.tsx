import {
  AlertDialog,
  AlertDialogBody,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogOverlay,
  Button,
} from "@chakra-ui/react"
import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import useAuction from "components/[auction]/hooks/useAuction"
import claimFunds from "contract-logic/transactions/claimFunds"
import useSubmit from "hooks/useSubmit"
import useToast from "hooks/useToast"
import { useRef } from "react"
import processContractError from "utils/processContractErrorr"

const ClaimDialog = ({ isOpen, onClose }) => {
  const { auction, mutate } = useAuction()
  const { connection } = useConnection()
  const { sendTransaction, publicKey } = useWallet()
  const toast = useToast()
  const alertCancelRef = useRef()

  const handleClaimFunds = async () => {
    const tx = await claimFunds(
      auction?.id,
      publicKey.toString(),
      auction?.ownerPubkey,
      auction?.currentCycle,
      auction?.availableTreasuryAmount
    )
    console.log(tx)
    const signature = await sendTransaction(tx, connection, {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    })
    console.log("info", "Transaction sent:", signature)

    await connection.confirmTransaction(signature, "confirmed")
    console.log("success", "Transaction successful!", signature)
  }

  const { onSubmit, isLoading } = useSubmit(handleClaimFunds, {
    onSuccess: () => {
      toast({
        title: `Funds successfully claimed!`,
        status: "success",
      })
      mutate()
      onClose()
    },
    onError: (e) => toast({ status: "error", ...processContractError(e) }),
  })

  return (
    <AlertDialog
      isOpen={isOpen}
      leastDestructiveRef={alertCancelRef}
      onClose={onClose}
    >
      <AlertDialogOverlay>
        <AlertDialogContent>
          <AlertDialogHeader>Claim funds</AlertDialogHeader>

          <AlertDialogBody>
            You have currently {auction?.availableTreasuryAmount} SOL available in
            your treasury. Would you like to claim this amount?
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={alertCancelRef} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={onSubmit}
              isLoading={isLoading}
              isDisabled={!auction?.availableTreasuryAmount}
              ml={3}
            >
              Claim
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialogOverlay>
    </AlertDialog>
  )
}

export default ClaimDialog
