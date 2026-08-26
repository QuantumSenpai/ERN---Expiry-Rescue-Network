$files = Get-ChildItem -Path src -Recurse -Include "*.tsx","*.ts","*.css" | Where-Object { $_.Name -notlike "*.d.ts" }
$fixedCount = 0
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    if (-not ($content -match "313F25")) { continue }
    $original = $content
    $content = $content -replace 'bg-\[#313F25\] text-\[10\.5px\] uppercase text-\[#666666\] border-b border-\[#313F25\]','bg-[#E2D9BE] text-[10.5px] uppercase text-[#2F4156] font-bold border-b border-[rgba(28,58,19,0.15)]'
    $content = $content -replace 'bg-\[#313F25\] text-xs uppercase text-\[#666666\] border-b border-\[#313F25\]','bg-[#E2D9BE] text-xs uppercase text-[#2F4156] font-bold border-b border-[rgba(28,58,19,0.15)]'
    $content = $content -replace 'bg-\[#313F25\] text-\[11px\] uppercase text-\[#666666\] border-b border-\[#313F25\]','bg-[#E2D9BE] text-[11px] uppercase text-[#2F4156] font-bold border-b border-[rgba(28,58,19,0.15)]'
    $content = $content -replace 'hover:bg-\[#313F25\] transition-colors cursor-pointer','hover:bg-[#E2D9BE]/40 transition-colors cursor-pointer'
    $content = $content -replace 'hover:bg-\[#313F25\] transition-colors"','hover:bg-[#E2D9BE]/40 transition-colors"'
    $content = $content -replace 'hover:bg-\[#313F25\] transition-all','hover:bg-[#E2D9BE]/40 transition-all'
    $content = $content -replace 'divide-\[#313F25\]','divide-[rgba(28,58,19,0.15)]'
    $content = $content -replace 'bg-\[#313F25\] border border-\[#313F25\] text-\[#2F4156\] placeholder:text-\[#666666\] focus:outline-none focus:border-\[#2F4156\] transition-all font-mono','bg-[#F0E9D3] border border-[rgba(28,58,19,0.2)] text-[#2F4156] placeholder:text-[#757C5D] focus:outline-none focus:border-[#2F4156] transition-all font-mono'
    $content = $content -replace 'bg-\[#313F25\] border border-\[#313F25\] text-\[#2F4156\] placeholder:text-\[#666666\] focus:outline-none focus:border-\[#2F4156\] font-sans text-xs','bg-[#F0E9D3] border border-[rgba(28,58,19,0.2)] text-[#2F4156] placeholder:text-[#757C5D] focus:outline-none focus:border-[#2F4156] font-sans text-xs'
    $content = $content -replace 'bg-\[#313F25\] border border-\[#313F25\] text-\[#2F4156\] placeholder:text-\[#666666\] focus:outline-none focus:border-\[#2F4156\]','bg-[#F0E9D3] border border-[rgba(28,58,19,0.2)] text-[#2F4156] placeholder:text-[#757C5D] focus:outline-none focus:border-[#2F4156]'
    $content = $content -replace 'bg-\[#313F25\] border border-\[#313F25\] text-\[#2F4156\] focus:outline-none cursor-pointer font-mono','bg-[#E2D9BE] border border-[rgba(28,58,19,0.15)] text-[#2F4156] focus:outline-none cursor-pointer font-mono font-bold'
    $content = $content -replace 'bg-\[#313F25\] border border-\[#313F25\] text-\[#2F4156\] font-mono text-xs outline-none','bg-[#F0E9D3] border border-[rgba(28,58,19,0.2)] text-[#2F4156] font-mono text-xs outline-none'
    $content = $content -replace 'bg-\[#313F25\] border border-\[#313F25\] text-\[#2F4156\] font-mono outline-none focus:border-\[#2F4156\]','bg-[#F0E9D3] border border-[rgba(28,58,19,0.2)] text-[#2F4156] font-mono outline-none focus:border-[#2F4156]'
    $content = $content -replace 'bg-\[#313F25\] border border-\[#313F25\] rounded-lg px-3\.5 py-2 text-xs font-mono text-\[#2F4156\] outline-none focus:border-\[#2F4156\]','bg-[#F0E9D3] border border-[rgba(28,58,19,0.2)] rounded-lg px-3.5 py-2 text-xs font-mono text-[#2F4156] outline-none focus:border-[#2F4156]'
    $content = $content -replace 'bg-\[#313F25\] border border-\[#313F25\] rounded-lg px-3 py-2 text-xs font-mono text-\[#2F4156\] outline-none focus:border-\[#2F4156\]','bg-[#F0E9D3] border border-[rgba(28,58,19,0.2)] rounded-lg px-3 py-2 text-xs font-mono text-[#2F4156] outline-none focus:border-[#2F4156]'
    $content = $content -replace 'bg-\[#313F25\] border border-\[#313F25\] rounded-lg px-3 py-2 text-xs text-\[#2F4156\] font-mono outline-none','bg-[#F0E9D3] border border-[rgba(28,58,19,0.2)] rounded-lg px-3 py-2 text-xs text-[#2F4156] font-mono outline-none'
    $content = $content -replace 'w-full bg-\[#313F25\] border border-\[#313F25\] rounded-lg px-3 py-2 text-xs font-mono text-\[#2F4156\] outline-none','w-full bg-[#F0E9D3] border border-[rgba(28,58,19,0.2)] rounded-lg px-3 py-2 text-xs font-mono text-[#2F4156] outline-none'
    $content = $content -replace 'bg-\[#313F25\] border border-\[#313F25\] rounded-lg px-3\.5 py-2 text-xs text-\[#2F4156\] outline-none focus:border-\[#2F4156\] font-sans','bg-[#F0E9D3] border border-[rgba(28,58,19,0.2)] rounded-lg px-3.5 py-2 text-xs text-[#2F4156] outline-none focus:border-[#2F4156] font-sans'
    $content = $content -replace 'bg-\[#313F25\] border border-\[#313F25\] rounded-lg px-3 py-2 text-xs text-\[#2F4156\] outline-none focus:border-\[#2F4156\] font-sans','bg-[#F0E9D3] border border-[rgba(28,58,19,0.2)] rounded-lg px-3 py-2 text-xs text-[#2F4156] outline-none focus:border-[#2F4156] font-sans'
    $content = $content -replace 'w-full px-3 py-2 rounded-lg bg-\[#313F25\] border border-\[#313F25\] text-\[#2F4156\] font-sans text-xs outline-none','w-full px-3 py-2 rounded-lg bg-[#F0E9D3] border border-[rgba(28,58,19,0.2)] text-[#2F4156] font-sans text-xs outline-none'
    $content = $content -replace 'w-full px-3 py-2 rounded-lg bg-\[#313F25\] border border-\[#313F25\] text-\[#2F4156\] font-mono text-xs outline-none','w-full px-3 py-2 rounded-lg bg-[#F0E9D3] border border-[rgba(28,58,19,0.2)] text-[#2F4156] font-mono text-xs outline-none'
    $content = $content -replace 'bg-\[#F0E9D3\] border border-\[#313F25\] rounded-\[24px\] sm:rounded-\[32px\]','bg-[#F9F6ED] border border-[rgba(28,58,19,0.15)] rounded-[24px] sm:rounded-[32px]'
    $content = $content -replace 'bg-\[#F0E9D3\] border border-\[#313F25\] rounded-\[24px\]','bg-[#F9F6ED] border border-[rgba(28,58,19,0.15)] rounded-[24px]'
    $content = $content -replace 'bg-\[#F0E9D3\] border border-\[#313F25\] rounded-2xl','bg-[#F9F6ED] border border-[rgba(28,58,19,0.15)] rounded-2xl'
    $content = $content -replace 'bg-\[#F0E9D3\] border border-\[#313F25\] rounded-xl','bg-[#F9F6ED] border border-[rgba(28,58,19,0.15)] rounded-xl'
    $content = $content -replace 'bg-\[#F0E9D3\] border border-\[#313F25\] rounded-\[32px\]','bg-[#F9F6ED] border border-[rgba(28,58,19,0.15)] rounded-[32px]'
    $content = $content -replace 'bg-\[#F0E9D3\] border border-\[#313F25\] overflow-hidden','bg-[#F9F6ED] border border-[rgba(28,58,19,0.15)] overflow-hidden'
    $content = $content -replace 'bg-\[#F0E9D3\] border border-\[#313F25\] rounded-lg','bg-[#F9F6ED] border border-[rgba(28,58,19,0.15)] rounded-lg'
    $content = $content -replace 'bg-\[#F0E9D3\] border border-\[#313F25\] rounded-full','bg-[#F9F6ED] border border-[rgba(28,58,19,0.15)] rounded-full'
    $content = $content -replace 'bg-\[#F0E9D3\] border border-\[#313F25\] shadow-none','bg-[#F9F6ED] border border-[rgba(28,58,19,0.15)] shadow-none'
    $content = $content -replace 'p-4 rounded-2xl bg-\[#313F25\] border border-\[#313F25\] space-y-2','p-4 rounded-2xl bg-[#E2D9BE]/50 border border-[rgba(28,58,19,0.15)] space-y-2'
    $content = $content -replace 'p-4 rounded-2xl bg-\[#313F25\] border border-\[#313F25\] space-y-3','p-4 rounded-2xl bg-[#E2D9BE]/50 border border-[rgba(28,58,19,0.15)] space-y-3'
    $content = $content -replace 'p-4 rounded-2xl bg-\[#313F25\] border border-\[#313F25\] space-y-4','p-4 rounded-2xl bg-[#E2D9BE]/50 border border-[rgba(28,58,19,0.15)] space-y-4'
    $content = $content -replace 'p-4 rounded-2xl bg-\[#313F25\] border border-\[#313F25\] grid','p-4 rounded-2xl bg-[#E2D9BE]/50 border border-[rgba(28,58,19,0.15)] grid'
    $content = $content -replace 'p-3 rounded-2xl bg-\[#313F25\] border border-\[#313F25\]','p-3 rounded-2xl bg-[#E2D9BE]/50 border border-[rgba(28,58,19,0.15)]'
    $content = $content -replace 'p-3\.5 rounded-2xl bg-\[#313F25\] border border-\[#313F25\]','p-3.5 rounded-2xl bg-[#E2D9BE]/50 border border-[rgba(28,58,19,0.15)]'
    $content = $content -replace 'p-2\.5 rounded-2xl bg-\[#313F25\] border border-\[#313F25\]','p-2.5 rounded-2xl bg-[#E2D9BE]/50 border border-[rgba(28,58,19,0.15)]'
    $content = $content -replace 'p-2 rounded-2xl bg-\[#313F25\] border border-\[#313F25\]','p-2 rounded-2xl bg-[#E2D9BE]/50 border border-[rgba(28,58,19,0.15)]'
    $content = $content -replace 'p-4 rounded-2xl bg-\[#313F25\] border border-\[#313F25\]','p-4 rounded-2xl bg-[#E2D9BE]/50 border border-[rgba(28,58,19,0.15)]'
    $content = $content -replace 'rounded-2xl bg-\[#313F25\] border border-\[#313F25\]','rounded-2xl bg-[#E2D9BE]/50 border border-[rgba(28,58,19,0.15)]'
    $content = $content -replace 'rounded-xl bg-\[#313F25\] border border-\[#313F25\]','rounded-xl bg-[#E2D9BE]/50 border border-[rgba(28,58,19,0.15)]'
    $content = $content -replace 'bg-\[#313F25\] rounded-full overflow-hidden','bg-[#E2D9BE] rounded-full overflow-hidden'
    $content = $content -replace 'h-1\.5 bg-\[#313F25\] rounded-full"','h-1.5 bg-[#E2D9BE] rounded-full"'
    $content = $content -replace 'h-2 bg-\[#313F25\] rounded-full"','h-2 bg-[#E2D9BE] rounded-full"'
    $content = $content -replace 'h-1 bg-\[#313F25\] rounded-full"','h-1 bg-[#E2D9BE] rounded-full"'
    $content = $content -replace 'border-b border-\[#313F25\]','border-b border-[rgba(28,58,19,0.15)]'
    $content = $content -replace 'border-t border-\[#313F25\]','border-t border-[rgba(28,58,19,0.15)]'
    $content = $content -replace 'border-l border-\[#313F25\]','border-l border-[rgba(28,58,19,0.15)]'
    $content = $content -replace 'border-r border-\[#313F25\]','border-r border-[rgba(28,58,19,0.15)]'
    $content = $content -replace ' border-\[#313F25\]"',' border-[rgba(28,58,19,0.15)]"'
    $content = $content -replace 'bg-\[#313F25\] hover:bg-\[#F0E9D3\] text-\[#2F4156\] uppercase font-bold cursor-pointer','bg-[#E2D9BE] hover:bg-[#d8ceaf] text-[#2F4156] uppercase font-bold cursor-pointer'
    $content = $content -replace 'bg-\[#313F25\] hover:bg-\[#F0E9D3\] text-\[#2F4156\]','bg-[#E2D9BE] hover:bg-[#d8ceaf] text-[#2F4156]'
    $content = $content -replace 'bg-\[#313F25\] text-\[#2F4156\] uppercase cursor-pointer hover:bg-\[#F0E9D3\]','bg-[#E2D9BE] text-[#2F4156] uppercase font-bold cursor-pointer hover:bg-[#d8ceaf]'
    $content = $content -replace 'p-1\.5 rounded-lg bg-\[#313F25\] text-\[#666666\] hover:text-\[#2F4156\] cursor-pointer','p-1.5 rounded-lg bg-[#E2D9BE] text-[#2F4156] hover:bg-[#d8ceaf] cursor-pointer'
    $content = $content -replace 'text-\[#666666\]','text-[#757C5D]'
    $content = $content -replace '"bg-\[#313F25\]"','"bg-[#E2D9BE]/50"'
    if ($content -ne $original) {
        Set-Content $file.FullName $content -Encoding UTF8 -NoNewline
        $fixedCount++
        Write-Host "Fixed: $($file.Name)"
    }
}
Write-Host ""
Write-Host "Total files fixed: $fixedCount"
