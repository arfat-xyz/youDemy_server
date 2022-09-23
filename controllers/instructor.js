import User from "../models/user";
const stripe = require("stripe")(process.env.STRIPE_SECRET);
import queryString from "query-string";
export const makeInstructor = async (req, res) => {
  try {
    // 1.   Find user from db
    const user = await User.findById(req.body._id).exec();

    // 2.   If user don't have stripe_account_id yet, then create new
    if (!user.stripe_account_id) {
      const account = await stripe.accounts.create({ type: "express" });
      user.stripe_account_id = account.id;
      user.save();
    }

    // 3.   Create account link based on account id (for frontend to complete On boarding)

    let accountLink = await stripe.accountLinks.create({
      account: user.stripe_account_id,
      refresh_url: process.env.STRIPE_REDIRECT_URL,
      return_url: process.env.STRIPE_REDIRECT_URL,
      type: "account_onboarding",
    });

    // 4.   pre-fill any info such as email(optional), then send url response to frontend
    accountLink = Object.assign(accountLink, {
      "stripe_user[email]": user.email,
    });
    // 5.   then send the account link as response to frontend
    res.send(`${accountLink.url}?${queryString.stringify(accountLink)}`);
  } catch (e) {
    console.log("error from controllers/instructor catch =>", e);
  }
};