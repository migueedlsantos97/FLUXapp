import * as React from 'react';
import { motion } from 'framer-motion';

export const WardenLogo: React.FC<{ size?: number; showText?: boolean }> = ({ size = 120, showText = true }) => {
    return (
        <div className="flex flex-col items-center justify-center">
            <svg
                viewBox="0 0 512 512"
                width={size}
                height={size}
                xmlns="http://www.w3.org/2000/svg"
                className="drop-shadow-[0_0_15px_rgba(255,59,48,0.3)]"
            >
                <rect width="512" height="512" fill="#0A0A0B" />

                <defs>
                    <clipPath id="top-cut">
                        <rect x="0" y="120" width="512" height="400" />
                    </clipPath>
                </defs>

                <motion.path
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeInOut" }}
                    d="M 100 80 L 186 350 L 256 250 L 326 350 L 412 80"
                    fill="none"
                    stroke="#F5F5F7"
                    strokeWidth="64"
                    strokeLinejoin="miter"
                    strokeMiterlimit="4"
                    clipPath="url(#top-cut)"
                />

                <motion.rect
                    x="232"
                    y="120"
                    width="48"
                    height="48"
                    fill="#FF3B30"
                    animate={{ opacity: [1, 0.4, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                />

                {showText && (
                    <motion.text
                        x="256"
                        y="465"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        fontFamily="Inter, sans-serif"
                        fontWeight="800"
                        fontSize="56"
                        fill="#F5F5F7"
                        letterSpacing="-2"
                        textAnchor="middle"
                    >
                        WARDEN
                    </motion.text>
                )}
            </svg>
        </div>
    );
};
