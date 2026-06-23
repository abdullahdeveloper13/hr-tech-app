import { Router } from "express"
import { authRouter } from "./auth"
import { attendanceRouter } from "./attendance"
import { checkinRouter } from "./checkin"
import { dashboardRouter } from "./dashboard"
import { employeesRouter } from "./employees"
import { leaveRouter } from "./leave"
import { offerLetterRouter } from "./offer-letter"
import { reportsRouter } from "./reports"
import { sendEmailRouter } from "./send-email"
import { settingsRouter } from "./settings"
import { slackRouter } from "./slack"
import { testEmailRouter } from "./test-email"
import { transactionsRouter } from "./transactions"

export const apiRouter = Router()

apiRouter.use("/auth", authRouter)
apiRouter.use("/attendance", attendanceRouter)
apiRouter.use("/checkin", checkinRouter)
apiRouter.use("/dashboard", dashboardRouter)
apiRouter.use("/employees", employeesRouter)
apiRouter.use("/leave", leaveRouter)
apiRouter.use("/offer-letter", offerLetterRouter)
apiRouter.use("/reports", reportsRouter)
apiRouter.use("/send-email", sendEmailRouter)
apiRouter.use("/settings", settingsRouter)
apiRouter.use("/slack", slackRouter)
apiRouter.use("/test-email", testEmailRouter)
apiRouter.use("/transactions", transactionsRouter)
