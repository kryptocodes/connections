import { AstrologyModal } from "@/components/modals/AstrologyModal";
import { ProfileImage } from "@/components/ui/ProfileImage";
import AppLayout from "@/layouts/AppLayout";
import { classed } from "@tw-classed/react";
import { NextSeo } from "next-seo";
import React, { ReactNode, useEffect, useState } from "react";
import { MdKeyboardArrowRight as ArrowRight } from "react-icons/md";
import { MdOutlineEdit as EditIcon } from "react-icons/md";
import { FaPlus as PlusIcon } from "react-icons/fa6";
import { FreakModal } from "@/components/modals/FreakModal";
import { SpookyModal } from "@/components/modals/SpookyModal";
import { User } from "@/lib/storage/types";
import { storage } from "@/lib/storage";

interface VaultCardProps {
  active?: boolean;
  title?: string;
  description?: string;
  icon?: ReactNode;
}
const VaultCardBase = classed.div("flex flex-col gap-1 p-3 rounded-lg", {
  variants: {
    active: {
      true: "bg-transparent border border-white",
      false: "bg-white/10",
    },
  },
  defaultVariants: {
    active: true,
  },
});

export const VaultCard = ({
  active = true,
  title,
  description,
  icon,
}: VaultCardProps) => {
  return (
    <VaultCardBase active={active}>
      <div className="flex items-center justify-between">
        <span className="text-primary text-sm font-normal">{title}</span>
        {icon && <div>{icon}</div>}
      </div>
      <span className="text-tertiary text-sm font-normal">{description}</span>
    </VaultCardBase>
  );
};

export default function HalloweenPage() {
  const [halloweenModalOpen, setHalloweenModalOpen] = useState(false);
  const [astrologyModalOpen, setAstrologyModalOpen] = useState(false);
  const [freakModalOpen, setFreakModalOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const user = await storage.getUser();
      if (!user) {
        return;
      }
      setUser(user)
    };

    getUser();
  }, []);

  let username = "";
  if (user?.userData?.username) {
    username = " " + user?.userData?.username;
  }
  const halloweenSubmitted = false;
  const astrologySubmitted = false;
  const freakSubmitted = false;
  return (
    <>
      <NextSeo title="Halloween" />
      <SpookyModal
        setIsOpen={setHalloweenModalOpen}
        isOpen={halloweenModalOpen}
        username={username}
      />
      <AstrologyModal
        setIsOpen={setAstrologyModalOpen}
        isOpen={astrologyModalOpen}
        username={username}
      />
      <FreakModal setIsOpen={setFreakModalOpen} isOpen={freakModalOpen} />
      <AppLayout
        showFooter={false}
        back={{
          href: "/",
          label: "Back",
        }}
        className="flex flex-col gap-4"
      >
        <div
          className="h-[135px] bg-slate-50 w-full rounded-lg overflow-hidden mt-4"
          style={{
            backgroundImage: `url('/images/halloween-party.svg')`,
            backgroundSize: "cover",
          }}
        />
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-4">
            <span className="text-primary text-lg font-sans font-bold">
              Halloween Party
            </span>
            <span className="text-tertiary text-base font-sans font-normal">
              A description et tristique viverra mus volutpat vitae dapibus a.
              In aliquam porttitor dignissim diam semper.
            </span>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-primary text-base font-sans font-bold">
              Vault entries
            </span>
            <div className="flex flex-col gap-2">
              <VaultCard
                active={halloweenSubmitted}
                title="Spooky vibe check 🎃"
                description="Opt-in to match with residents who have similar or complimentary goals. "
                icon={
                  <button
                    onClick={() => {
                      setHalloweenModalOpen(true);
                    }}
                  >
                    {halloweenSubmitted ? (
                      <EditIcon size={18} className="text-white" />
                    ) : (
                      <PlusIcon size={18} className="text-white" />
                    )}
                  </button>
                }
              />
              <VaultCard
                active={astrologySubmitted}
                title="My astrology signs ✨"
                description="You can now match with residents who have similar or complimentary goals. "
                icon={
                  <button
                    onClick={() => {
                      setAstrologyModalOpen(true);
                    }}
                  >
                    {astrologySubmitted ? (
                      <EditIcon size={18} className="text-white" />
                    ) : (
                      <PlusIcon size={18} className="text-white" />
                    )}
                  </button>
                }
              />
              <VaultCard
                title="Match my freak 👹"
                description="You can now match with residents who have similar or complimentary goals. "
                icon={
                  <button
                    onClick={() => {
                      setFreakModalOpen(true);
                    }}
                  >
                    {freakSubmitted ? (
                      <EditIcon size={18} className="text-white" />
                    ) : (
                      <PlusIcon size={18} className="text-white" />
                    )}
                  </button>
                }
                active={false}
              />
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <span className="text-primary text-base font-sans font-bold">
              Connections
            </span>
            <span className="text-tertiary text-base font-sans font-normal">
              You have intersecting entries in your vaults. Message to meet up!
            </span>
            {
              user ? <div className="flex gap-4 items-center">
              <ProfileImage user={user.userData}/>
              <div className="flex flex-col">
                <span className="text-sm font-medium font-sans text-primary">
                  Lorem, ipsum dolor.
                </span>
                <span className="text-xs font-medium font-sans text-[#FF9DF8]">
                  @username
                </span>
              </div>
              <ArrowRight size={18} className="text-white ml-auto"/>
            </div> : <></>
            }
          </div>
        </div>
      </AppLayout>
    </>
  );
}