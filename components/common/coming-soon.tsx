"use client"

import { HugeiconsIcon } from "@hugeicons/react"
import { Settings01Icon } from "@hugeicons/core-free-icons"
import { Card, CardContent } from "@/components/ui/card"

interface ComingSoonProps {
  title?: string
  description?: string
}

export function ComingSoon({
  title = "준비중입니다",
  description = "해당 기능은 현재 개발 중입니다. 빠른 시일 내에 서비스를 제공할 수 있도록 노력하겠습니다."
}: ComingSoonProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px] p-6">
      <Card className="w-full max-w-md border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center">
          <div className="rounded-full bg-muted p-4 mb-4">
            <HugeiconsIcon icon={Settings01Icon} className="h-8 w-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">{title}</h2>
          <p className="text-muted-foreground text-sm leading-relaxed">
            {description}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
