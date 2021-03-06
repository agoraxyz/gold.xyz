import { useConnection, useWallet } from "@solana/wallet-adapter-react"
import useAuction from "components/[auction]/hooks/useAuction"
import useCycle from "components/[auction]/hooks/useCycle"
import placeBid from "contract-logic/transactions/placeBid"
import useSubmit from "hooks/useSubmit"
import useToast from "hooks/useToast"
import processContractError from "utils/processContractErrorr"

type Data = {
  // string as it comes from the form
  amount: string
}

const usePlaceBid = (setValue) => {
  const toast = useToast()
  const { connection } = useConnection()
  const { sendTransaction, publicKey } = useWallet()
  const { auction, mutate: mutateAuction } = useAuction()
  const { mutate: mutateCycle } = useCycle()

  const handlePlaceBid = async ({ amount: inputAmount }: Data) => {
    const amount_ = parseFloat(inputAmount)
    const tx = await placeBid(
      publicKey.toString(),
      auction.id,
      auction?.currentCycle,
      amount_
    )
    console.log(tx)
    const signature = await sendTransaction(tx, connection, {
      skipPreflight: false,
      preflightCommitment: "processed",
    })
    console.log("info", "Transaction sent:", signature)

    await connection.confirmTransaction(signature, "confirmed")
    console.log("success", "Transaction successful!", signature)
  }

  return useSubmit<Data, any>(handlePlaceBid, {
    onError: (e) => toast({ status: "error", ...processContractError(e) }),
    onSuccess: () => {
      toast({
        title: "Bid placed successfully",
        status: "success",
      })
      mutateCycle()
      mutateAuction()
      setValue("amount", "")
    },
  })
}

export default usePlaceBid
