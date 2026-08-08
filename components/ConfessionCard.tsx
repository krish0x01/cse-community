"use client";

import { useState, useEffect } from "react";
import { Confession, ConfessionComment } from "@/lib/types";
import {
  Heart,
  MessageCircle,
  Share2,
  Flame,
  User,
  Send,
} from "lucide-react";
import Toast from "./Toast";
import { supabase, isSupabaseConfigured } from "@/lib/supabase";

interface ConfessionCardProps {
  confession: Confession;
  onLikeToggle?: (id: string, newLikedState: boolean) => void;
}

export default function ConfessionCard({ confession }: ConfessionCardProps) {
  const [liked, setLiked] = useState(confession.hasLiked || false);
  const [likesCount, setLikesCount] = useState(confession.likes);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<ConfessionComment[]>(confession.comments || []);
  const [newCommentText, setNewCommentText] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync like count when updated in parent realtime state
  useEffect(() => {
    setLikesCount(confession.likes);
  }, [confession.likes]);

  // Realtime comments subscription for this specific confession
  useEffect(() => {
    if (!showComments || !isSupabaseConfigured() || !supabase) return;

    // Fetch latest comments first
    const fetchLatestComments = async () => {
      try {
        const res = await fetch(`/api/confessions/${confession.id}/comments`);
        const json = await res.json();
        if (json.comments && Array.isArray(json.comments)) {
          interface RawComment {
            id: string;
            author: string;
            text: string;
            created_at?: string;
          }
          const mapped: ConfessionComment[] = (json.comments as RawComment[]).map((c) => ({
            id: c.id,
            author: c.author,
            text: c.text,
            timestamp: c.created_at
              ? new Date(c.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
              : "Just now",
          }));
          setComments(mapped);
        }
      } catch {
        // Fallback to local comments state
      }
    };

    fetchLatestComments();

    // Subscribe to new incoming comments on this confession
    const commentChannel = supabase
      .channel(`comments_${confession.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "comments",
          filter: `confession_id=eq.${confession.id}`,
        },
        (payload) => {
          interface RawNewComment {
            id: string;
            author: string;
            text: string;
            created_at?: string;
          }
          const raw = payload.new as RawNewComment;
          const newComment: ConfessionComment = {
            id: raw.id,
            author: raw.author,
            text: raw.text,
            timestamp: "Just now",
          };

          setComments((prev) => {
            if (prev.some((c) => c.id === newComment.id)) return prev;
            return [...prev, newComment];
          });
        }
      )
      .subscribe();

    return () => {
      supabase?.removeChannel(commentChannel);
    };
  }, [showComments, confession.id]);

  const handleLike = async () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikesCount((prev) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    if (nextLiked) setToastMessage("Liked confession! +1 resonance");

    try {
      await fetch(`/api/confessions/${confession.id}/like`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ increment: nextLiked ? 1 : -1 }),
      });
    } catch {
      // Keep optimistic UI state
    }
  };

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    const commentText = newCommentText.trim();
    const tempId = `temp-${Date.now()}`;
    const tempComment: ConfessionComment = {
      id: tempId,
      author: "AnonymousEngineer",
      text: commentText,
      timestamp: "Just now",
    };

    setComments((prev) => [...prev, tempComment]);
    setNewCommentText("");
    setToastMessage("Anonymous comment sent live!");

    try {
      const res = await fetch(`/api/confessions/${confession.id}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          author: "AnonymousEngineer",
          text: commentText,
        }),
      });
      const data = await res.json();
      if (data.data?.id) {
        setComments((prev) =>
          prev.map((c) => (c.id === tempId ? { ...c, id: data.data.id } : c))
        );
      }
    } catch {
      // Keep optimistic UI state
    }
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.origin}/confessions#${confession.id}`);
      setToastMessage("Confession link copied to clipboard!");
    } else {
      setToastMessage("Confession link ready to share!");
    }
  };

  const categoryColors: Record<string, { bg: string; text: string; border: string }> = {
    Academics: { bg: "bg-cyan-950/70", text: "text-cyan-300", border: "border-cyan-500/40" },
    Rants: { bg: "bg-amber-950/70", text: "text-amber-300", border: "border-amber-500/40" },
    "Campus Life": { bg: "bg-emerald-950/70", text: "text-emerald-300", border: "border-emerald-500/40" },
    Romance: { bg: "bg-pink-950/70", text: "text-pink-300", border: "border-pink-500/40" },
    Placements: { bg: "bg-purple-950/70", text: "text-purple-300", border: "border-purple-500/40" },
    Hostel: { bg: "bg-orange-950/70", text: "text-orange-300", border: "border-orange-500/40" },
  };

  const catStyle = categoryColors[confession.category] || {
    bg: "bg-slate-800",
    text: "text-slate-300",
    border: "border-slate-700",
  };

  return (
    <>
      <article className="group bg-slate-900/80 rounded-2xl border border-slate-800 hover:border-cyan-500/40 shadow-card hover:shadow-card-hover transition-all duration-300 p-5 sm:p-6 flex flex-col justify-between relative overflow-hidden backdrop-blur-md">
        {/* Top trending gradient indicator */}
        {confession.isTrending && (
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-500 shadow-cyan" />
        )}

        <div>
          {/* Card Header: Author alias, batch, timestamp, category */}
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-mono text-xs font-semibold">
                <User className="w-4 h-4 text-cyan-400" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono font-medium text-xs text-white">
                    {confession.alias}
                  </span>
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 border border-slate-700/80">
                    {confession.batch}
                  </span>
                </div>
                <span className="text-[11px] text-slate-400">{confession.timestamp}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {confession.isTrending && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-rose-950/80 text-rose-300 border border-rose-500/40 shadow-sm">
                  <Flame className="w-3 h-3 text-rose-400 fill-rose-400 animate-pulse" />
                  Trending
                </span>
              )}
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
              >
                {confession.category}
              </span>
            </div>
          </div>

          {/* Confession Body Text */}
          <p className="text-slate-200 text-[15px] sm:text-base leading-relaxed font-normal mb-5 whitespace-pre-line selection:bg-cyan-500/30">
            {confession.content}
          </p>

          {/* Tags */}
          {confession.tags && confession.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-5">
              {confession.tags.map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-mono text-cyan-400/90 hover:text-cyan-300 bg-slate-800/80 px-2 py-0.5 rounded-md border border-cyan-500/20 transition-colors"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions: Like, Comment, Share */}
        <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Like Button */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                liked
                  ? "bg-pink-950/80 text-pink-300 border border-pink-500/60 shadow-sm"
                  : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-pink-500/40 hover:text-pink-300"
              }`}
              aria-label="Like confession"
            >
              <Heart
                className={`w-4 h-4 transition-transform duration-200 ${
                  liked ? "fill-pink-400 text-pink-400 scale-110" : "group-hover:scale-110"
                }`}
              />
              <span>{likesCount}</span>
            </button>

            {/* Comment Drawer Toggle */}
            <button
              onClick={() => setShowComments(!showComments)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 ${
                showComments
                  ? "bg-purple-900/80 text-purple-200 border border-purple-500/50 shadow-purple"
                  : "bg-slate-800/80 hover:bg-slate-800 text-slate-300 border border-slate-700 hover:border-purple-500/40 hover:text-purple-300"
              }`}
              aria-label="View comments"
            >
              <MessageCircle className="w-4 h-4" />
              <span>{comments.length}</span>
            </button>
          </div>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="p-2 rounded-full text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
            title="Copy link to confession"
            aria-label="Share confession"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>

        {/* Expanded Realtime Comments Drawer */}
        {showComments && (
          <div className="mt-4 pt-4 border-t border-slate-800 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-purple-400 font-mono flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-cyan" />
                <span>Live Discourse ({comments.length})</span>
              </h4>
              <span className="text-[10px] font-mono text-slate-500">Realtime Socket Active</span>
            </div>

            {/* Comment list */}
            <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
              {comments.map((comment) => (
                <div
                  key={comment.id}
                  className="bg-slate-800/90 rounded-xl p-3 border border-slate-700/80 text-xs animate-fade-in"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-semibold text-cyan-300">
                      {comment.author}
                    </span>
                    <span className="text-[10px] text-slate-400">{comment.timestamp}</span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{comment.text}</p>
                </div>
              ))}
            </div>

            {/* Post new comment form */}
            <form onSubmit={handleAddComment} className="flex gap-2 pt-1">
              <input
                type="text"
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                placeholder="Add an anonymous reply live..."
                className="flex-1 px-3 py-2 text-xs rounded-xl bg-slate-800 border border-slate-700 text-white placeholder:text-slate-500 focus:bg-slate-900 focus:border-cyan-400"
              />
              <button
                type="submit"
                className="px-3 py-2 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1 transition-all shadow-sm"
              >
                <Send className="w-3 h-3" />
                <span>Reply</span>
              </button>
            </form>
          </div>
        )}
      </article>

      {toastMessage && (
        <Toast message={toastMessage} onClose={() => setToastMessage(null)} />
      )}
    </>
  );
}
