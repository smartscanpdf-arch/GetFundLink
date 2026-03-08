"use client";
import { MessagesPage } from "@/components/shared/MessagesPage";
import { INVESTOR_NAV } from "../client";
export default function InvestorMessagesPage() { return <MessagesPage role="investor" navItems={INVESTOR_NAV}/>; }
