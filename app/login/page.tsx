"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

export default function LoginPage() {
  const router = useRouter()
  const [userId, setUserId] = useState("")
  const [password, setPassword] = useState("")
  const [saveId, setSaveId] = useState(false)
  const [error, setError] = useState("")

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    // 로그인 검증: nvh / 1234
    if (userId === "nvh" && password === "1234") {
      // 로그인 성공 → 대시보드로 이동
      router.push("/")
    } else {
      // 로그인 실패
      setError("아이디 또는 비밀번호가 일치하지 않습니다.")
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <Image
              src="/images/biglogo.jpg"
              alt="경동나비엔"
              width={200}
              height={50}
              className="mx-auto h-12 w-auto object-contain mb-4"
              priority
            />
            <h1 className="text-xl font-semibold text-gray-800">
              NVH코리아 정산 관리자 시스템
            </h1>
          </div>

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* User ID Field */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="userId" className="text-sm font-medium text-gray-700">
                  아이디
                </Label>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="saveId"
                    checked={saveId}
                    onCheckedChange={(checked) => setSaveId(checked === true)}
                  />
                  <Label
                    htmlFor="saveId"
                    className="text-sm font-normal text-gray-600 cursor-pointer"
                  >
                    아이디저장
                  </Label>
                </div>
              </div>
              <Input
                id="userId"
                type="text"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="아이디를 입력하세요"
                className="h-11"
                autoComplete="off"
              />
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                비밀번호
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className="h-11"
                autoComplete="new-password"
              />
            </div>

            {/* Error Message */}
            {error && (
              <p className="text-sm text-red-500 text-center">{error}</p>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-medium text-base"
            >
              로그인
            </Button>
          </form>

          {/* Links */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <Link
              href="/find-id"
              className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
            >
              아이디 찾기 &gt;
            </Link>
            <span className="text-gray-300">|</span>
            <Link
              href="/reset-password"
              className="text-sm text-gray-600 hover:text-gray-800 hover:underline"
            >
              비밀번호 재설정 &gt;
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 border-t border-gray-200 bg-white">
        <div className="text-center space-y-2">
          <p className="text-sm text-gray-600">
            담당자: 홍길동 수석 / 김민수 수석
          </p>
          <p className="text-xs text-gray-400">
            Copyright © NVH Korea. All Rights Reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}
