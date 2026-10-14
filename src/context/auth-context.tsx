"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { User, UserProfile } from "@/lib/types/models";
import { AuthRepository } from "@/lib/repositories/auth-repository";
import { UserRepository } from "@/lib/repositories/user-repository";
import { LoginInput, SignupInput } from "@/lib/validations/auth";
import { UpdateProfileInput } from "@/lib/validations/user-profile";

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  signIn: (input: LoginInput) => Promise<void>;
  signUp: (input: SignupInput) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (input: UpdateProfileInput) => Promise<UserProfile>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const refreshSession = useCallback(async () => {
    try {
      const session = await AuthRepository.getSession();
      if (session) {
        setUser(session.user);
        setProfile(session.profile);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch {
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshSession();
  }, [refreshSession]);

  const signIn = async (input: LoginInput) => {
    setIsLoading(true);
    try {
      const session = await AuthRepository.signIn(input);
      setUser(session.user);
      setProfile(session.profile);
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (input: SignupInput) => {
    setIsLoading(true);
    try {
      const session = await AuthRepository.signUp(input);
      setUser(session.user);
      setProfile(session.profile);
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await AuthRepository.signOut();
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (input: UpdateProfileInput) => {
    if (!user) throw new Error("Must be authenticated to update profile");
    const updated = await UserRepository.updateProfile(user.id, input);
    setProfile(updated);
    return updated;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        signIn,
        signUp,
        signOut,
        updateProfile,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
