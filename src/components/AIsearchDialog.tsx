import { Box, Button, CircularProgress, Dialog, DialogContent, Typography } from "@mui/material";
import { useEffect, type FC } from "react";
import useGoogleApi from "../Hooks/useGoogleApi";
import type { ShityosonText } from "../api/types";

type Props = {
    open: boolean
    onClose: () => void
    shityoson: ShityosonText | null
}

/**
 * **太字** などのインライン装飾をパースするヘルパー
 */
const parseInlineFormatting = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
            return (
                <Box
                    key={i}
                    component="span"
                    sx={{
                        fontWeight: "bold",
                        color: "#0f172a",
                        bgcolor: "rgba(25, 118, 210, 0.08)",
                        px: 0.5,
                        py: 0.2,
                        borderRadius: 1,
                    }}
                >
                    {part.slice(2, -2)}
                </Box>
            );
        }
        return part;
    });
};

/**
 * 行ごとのマークダウン（### や箇条書き）を整形・スタイル付けする関数
 */
const renderFormattedText = (text: string) => {
    if (!text) return null;

    const lines = text.split("\n");
    return lines.map((line, index) => {
        // ### 見出し3 / ヘッダー
        if (line.startsWith("### ")) {
            return (
                <Typography
                    key={index}
                    variant="h6"
                    sx={{
                        fontWeight: "bold",
                        color: "primary.main",
                        mt: 2.5,
                        mb: 1,
                        borderBottom: "2px solid #e2e8f0",
                        pb: 0.5,
                    }}
                >
                    {parseInlineFormatting(line.replace(/^###\s*/, ""))}
                </Typography>
            );
        }
        // ## 見出し2
        if (line.startsWith("## ")) {
            return (
                <Typography
                    key={index}
                    variant="h5"
                    sx={{
                        fontWeight: "bold",
                        color: "primary.dark",
                        mt: 3,
                        mb: 1,
                    }}
                >
                    {parseInlineFormatting(line.replace(/^##\s*/, ""))}
                </Typography>
            );
        }
        // 箇条書き (- や * )
        if (line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
            const content = line.trim().replace(/^[-*]\s*/, "");
            return (
                <Box
                    key={index}
                    sx={{
                        display: "flex",
                        alignItems: "flex-start",
                        ml: 1.5,
                        my: 0.5,
                    }}
                >
                    <Box
                        component="span"
                        sx={{
                            width: 6,
                            height: 6,
                            borderRadius: "50%",
                            bgcolor: "primary.main",
                            mt: 1.1,
                            mr: 1.5,
                            flexShrink: 0,
                        }}
                    />
                    <Typography variant="body1" component="div" sx={{ lineHeight: 1.7 }}>
                        {parseInlineFormatting(content)}
                    </Typography>
                </Box>
            );
        }

        // 空行
        if (line.trim() === "") {
            return <Box key={index} sx={{ height: 8 }} />;
        }

        // 通常テキスト
        return (
            <Typography key={index} variant="body1" sx={{ my: 0.5, lineHeight: 1.7, color: "#334155" }}>
                {parseInlineFormatting(line)}
            </Typography>
        );
    });
};

const AIsearchDialog: FC<Props> = (props) => {
    const {open, onClose, shityoson} = props
    const {loading, interactionResult, setInteraction} = useGoogleApi()

    useEffect(() => {
        if (open) {
            setInteraction(shityoson)
        }
    }, [open, shityoson, setInteraction])

    return (
        <Dialog open={open} maxWidth="md" fullWidth>
            <DialogContent>
                {loading ? (
                    <Box sx={{
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "center",
                        alignItems: "center",
                        gap: 2,
                        p: 4
                    }}>
                        <CircularProgress size={50} />
                        <Typography component="p" sx={{fontWeight: "bold"}}>AI調査中...</Typography>
                    </Box>
                ) : (
                    <Box sx={{ my: 1, px: 1 }}>
                        {interactionResult && (
                            <>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, pb: 1, borderBottom: '1px solid #eee' }}>
                                    <Typography variant="subtitle2" color="text.secondary">
                                        AI Model: {interactionResult.model || "---"}
                                    </Typography>
                                </Box>

                                <Box sx={{ my: 2 }}>
                                    {interactionResult.output_text
                                        ? renderFormattedText(interactionResult.output_text)
                                        : <Typography color="text.secondary">情報がありません。</Typography>
                                    }
                                </Box>

                                <Box sx={{ mt: 3, textAlign: 'right' }}>
                                    <Button variant="contained" onClick={onClose}>閉じる</Button>
                                </Box>
                            </>
                        )}
                    </Box>
                )}
            </DialogContent>
        </Dialog>
    )
}

export default AIsearchDialog