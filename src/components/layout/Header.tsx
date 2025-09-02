"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";
import {
  Heart,
  Baby,
  PartyPopper,
  LogIn,
  Heart as HeartIcon,
  Building2 as VenueIcon,
  Camera,
  Music,
  UtensilsCrossed,
  Flower,
  ClipboardList,
  Star,
} from "lucide-react";

export function Header() {
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      if (currentScrollY > lastScrollY && currentScrollY > 300) {
        // Scrolling down and past 300px - hide header
        setIsHeaderVisible(false);
      } else if (currentScrollY < lastScrollY) {
        // Scrolling up - show header
        setIsHeaderVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [lastScrollY]);

  return (
    <header
      className={`sticky top-0 z-50 bg-white border-b border-border transition-transform duration-300 ease-in-out ${
        !isHeaderVisible ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="max-w-8xl mx-auto">
        {/* First Row - Main Header (4rem) */}
        <div className="h-16 px-8">
          <div className="flex items-center justify-between h-full">
            {/* Left Side - Event Types */}
            <div className="flex items-center space-x-6">
              <Link
                href="/weddings"
                className="flex items-center space-x-2 text-text-secondary hover:text-primary-500 transition-colors"
              >
                <Heart className="w-4 h-4" />
                <span className="text-sm font-medium">Weddings</span>
              </Link>
              <Link
                href="/christenings"
                className="flex items-center space-x-2 text-text-secondary hover:text-primary-500 transition-colors"
              >
                <Baby className="w-4 h-4" />
                <span className="text-sm font-medium">Christenings</span>
              </Link>
              <Link
                href="/parties"
                className="flex items-center space-x-2 text-text-secondary hover:text-primary-500 transition-colors"
              >
                <PartyPopper className="w-4 h-4" />
                <span className="text-sm font-medium">Parties</span>
              </Link>
            </div>

            {/* Center - Logo */}
            <div className="flex-1 flex justify-center">
              <Link href="/" className="text-2xl text-display font-light">
                <span className="text-black">Moment</span>
                <span className="text-primary-500">Moi</span>
              </Link>
            </div>

            {/* Right Side - Auth Buttons */}
            <div className="flex items-center space-x-3">
              <Button variant="outline" size="sm" asChild>
                <Link
                  href="/auth/login"
                  className="flex items-center space-x-2"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Log in</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <Link href="/favorites" className="flex items-center space-x-2">
                  <HeartIcon className="w-4 h-4" />
                  <span>Favorites</span>
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Second Row - Vendor Categories (2.5rem, dark background) */}
        <div className="h-10 bg-primary-900 px-8 flex items-center">
          <nav className="flex items-center justify-start space-x-8">
            <Link
              href="/vendors/venues"
              className="flex items-center space-x-2 text-white hover:text-primary-300 transition-colors"
            >
              <VenueIcon className="w-4 h-4" />
              <span className="text-xs font-medium">Venues</span>
            </Link>
            <Link
              href="/vendors/photographers"
              className="flex items-center space-x-2 text-white hover:text-primary-300 transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span className="text-xs font-medium">Photographers</span>
            </Link>
            <Link
              href="/vendors/catering"
              className="flex items-center space-x-2 text-white hover:text-primary-300 transition-colors"
            >
              <UtensilsCrossed className="w-4 h-4" />
              <span className="text-xs font-medium">Catering</span>
            </Link>
            <Link
              href="/vendors/florists"
              className="flex items-center space-x-2 text-white hover:text-primary-300 transition-colors"
            >
              <Flower className="w-4 h-4" />
              <span className="text-xs font-medium">Florists</span>
            </Link>
            <Link
              href="/vendors/music"
              className="flex items-center space-x-2 text-white hover:text-primary-300 transition-colors"
            >
              <Music className="w-4 h-4" />
              <span className="text-xs font-medium">Music & DJ</span>
            </Link>
            <Link
              href="/vendors/planners"
              className="flex items-center space-x-2 text-white hover:text-primary-300 transition-colors"
            >
              <ClipboardList className="w-4 h-4" />
              <span className="text-xs font-medium">Planners</span>
            </Link>
            <Link
              href="/vendors/other"
              className="flex items-center space-x-2 text-white hover:text-primary-300 transition-colors"
            >
              <Star className="w-4 h-4" />
              <span className="text-xs font-medium">Other</span>
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
