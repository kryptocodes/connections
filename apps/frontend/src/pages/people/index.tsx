import React, { useState, useEffect } from "react";
import Link from "next/link";
import { storage } from "@/lib/storage";
import { Connection } from "@/lib/storage/types";
import AppLayout from "@/layouts/AppLayout";
import { MdKeyboardArrowRight as ArrowRight } from "react-icons/md";
import { ProfileImage } from "@/components/ui/ProfileImage";
import { Banner } from "@/components/cards/Banner";
import useSettings from "@/hooks/useSettings";
import { getUnregisteredUser } from "@/lib/storage/localStorage/user";
import { useRouter } from "next/router";

function sortConnections(connections: Record<string, Connection>) {
  return Object.entries(connections)
    .sort(
      ([, a], [, b]) =>
        b.taps[b.taps.length - 1].timestamp.getTime() -
        a.taps[a.taps.length - 1].timestamp.getTime()
    )
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});
}

const PeoplePage: React.FC = () => {
  const router = useRouter();

  const { darkTheme } = useSettings();
  const [connections, setConnections] = useState<Record<string, Connection>>(
    {}
  );

  useEffect(() => {
    const fetchConnections = async () => {
      const user = await storage.getUser();
      const unregisteredUser = await getUnregisteredUser();
      if (!user && !unregisteredUser) {
        router.push("/")
        return;
      }

      let sortedConnections = {};
      if (user) {
        sortedConnections = sortConnections(user.connections);
      } else if (unregisteredUser) {
        sortedConnections = sortConnections(unregisteredUser.connections);
      }
      setConnections(sortedConnections);
    };

    fetchConnections();
  }, []);

  return (
    <AppLayout
      seoTitle="People"
      header={
        <>
          <span className="text-label-primary font-medium">People</span>
          <div
            className="absolute left-0 right-0 bottom-0 h-[2px]"
            style={{
              background: `linear-gradient(90deg, #7A74BC 0%, #FF9DF8 39%, #FB5D42 71%, #F00 100%)`,
            }}
          ></div>
        </>
      }
      className="mx-auto"
      withContainer={false}
    >
      <div className="w-full px-4 py-4">
        <Banner
          className="justify-center"
          italic={false}
          title={
            <span className="!font-normal text-center">
              <b>Tap NFC chips </b> -- share socials, organize contacts, and
              discover shared interests! Troubleshoot tapping{" "}
              <a
                href="https://cursive.team/tap-help"
                className="underline"
                target="_blank"
                rel="noopener noreferrer"
              >
                here
              </a>
              .
            </span>
          }
        />
      </div>
      {Object.keys(connections).length === 0 ? (
        <div className="p-4 text-center text-label-secondary px-16">
          {`No connections yet.`}
        </div>
      ) : (
        <ul className="flex flex-col">
          {Object.values(connections).map((connection, index) => (
            <li
              key={connection.user.username}
              className="p-4"
              style={{
                borderTop:
                  index === 0 && darkTheme
                    ? "0.5px solid rgba(255, 255, 255, 0.20)"
                    : "0.5px solid rgba(0, 0, 0, 0.20)",
                // for some reason tailwind not applying
                borderBottom: darkTheme
                  ? "0.5px solid rgba(255, 255, 255, 0.20)"
                  : "0.5px solid rgba(0, 0, 0, 0.20)",
              }}
            >
              <Link
                className="grid grid-cols-[1fr_20px] items-center gap-4"
                href={`/people/${connection.user.username}`}
              >
                <div className="flex items-center gap-4">
                  <ProfileImage user={connection.user} />
                  <div className="flex flex-col gap-1">
                    <span className="text-sm font-medium text-label-primary">
                      {connection.user.displayName}
                    </span>
                    <span className="text-xs text-label-secondary font-medium">
                      @{connection.user.username}
                    </span>
                  </div>
                </div>
                <ArrowRight className="ml-auto" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </AppLayout>
  );
};

export default PeoplePage;
