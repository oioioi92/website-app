import { redirect } from "next/navigation";

/** /register 统一指向 WhatsApp 注册页 */
export default function RegisterRedirect() {
  redirect("/register-wa");
}

