import React, { useState, useEffect, useRef } from "react";
import {
  Users,
  Play,
  X,
  Clock,
  Gamepad2,
  Wifi,
  Trophy,
  Send,
  MessageCircle,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { io } from "socket.io-client";
import useUser from "@/context/User/UserHook";

const MatchmakingLobby = () => {
  const { user: _user, logout: _logout } = useUser();

  const [socket, setSocket] = useState(null);
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [inQueue, setInQueue] = useState(false);
  const [matchFound, setMatchFound] = useState(false);
  const [matchData, setMatchData] = useState(null);
  const [gameRoom, setGameRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState("");
  const [selectedMove, setSelectedMove] = useState(null);
  const [gameResult, setGameResult] = useState(null);
  const [playerMoved, setPlayerMoved] = useState({});

  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Get username and token from localStorage or _user
    let userName = "Guest";
    let token = null;

    const userInfo = localStorage.getItem("userInfo");
    if (userInfo) {
      const user = JSON.parse(userInfo);
      userName = user.name || user.username || "Guest";
      token = user.token;
    }

    // Override with _user if available
    if (_user && _user.name) {
      userName = _user.name;
    }
    if (_user && _user.token) {
      token = _user.token;
    }

    console.log("🔵 Connecting with username:", userName);
    console.log("🔑 Token available:", token ? "Yes" : "No");

    const newSocket = io("http://localhost:5000", {
      auth: {
        token: token || "demo-token",
      },
    });

    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("✅ Connected to server - Socket ID:", newSocket.id);
      console.log("👤 User name being used:", userName);
    });

    newSocket.on("user-data", (data) => {
      console.log("📨 Received user-data from server:", data);
    });

    newSocket.on("online-users", (data) => {
      setOnlineCount(data.count);
      setOnlineUsers(data.users);
    });

    newSocket.on("new-message", (message) => {
      console.log("📨 Received new message:", message);
      setMessages((prev) => [...prev, message]);
    });

    newSocket.on("match-found", (data) => {
      setMatchFound(true);
      setMatchData(data);
      setInQueue(false);
      setGameRoom(data.roomId);
    });

    newSocket.on("player-moved", (data) => {
      setPlayerMoved((prev) => ({ ...prev, [data.playerId]: true }));
    });

    newSocket.on("game-result", (result) => {
      setGameResult(result);
      setPlayerMoved({});
    });

    newSocket.on("game-reset", () => {
      setSelectedMove(null);
      setGameResult(null);
      setPlayerMoved({});
    });

    newSocket.on("player-left", (data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          username: "System",
          text: `${data.playerName} left the room`,
          timestamp: new Date().toISOString(),
        },
      ]);
    });

    newSocket.on("error", (error) => {
      console.error("Socket error:", error);
      alert(error.message);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [_user]);

  const handleJoinQueue = () => {
    if (socket) {
      socket.emit("join-queue");
      setInQueue(true);
    }
  };

  const handleLeaveQueue = () => {
    if (socket) {
      socket.emit("leave-queue");
      setInQueue(false);
    }
  };

  const handleSendMessage = () => {
    if (socket && messageInput.trim()) {
      // Get the username to send
      const userName = _user?.name || "Guest";

      console.log("📤 Sending message with username:", userName);

      const newMessage = {
        text: messageInput,
        username: userName,
      };

      // Emit to server - server will broadcast to all clients including sender
      socket.emit("send-message", newMessage);

      // Clear input
      setMessageInput("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleGameMove = (move) => {
    if (socket && !selectedMove) {
      setSelectedMove(move);
      socket.emit("game-move", { move });
    }
  };

  const handlePlayAgain = () => {
    if (socket) {
      socket.emit("play-again");
    }
  };

  const handleLeaveRoom = () => {
    if (socket) {
      socket.emit("leave-room");
      setMatchFound(false);
      setMatchData(null);
      setGameRoom(null);
      setSelectedMove(null);
      setGameResult(null);
      setPlayerMoved({});
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "In Lobby":
        return "bg-gray-500";
      case "In Queue":
        return "bg-yellow-500";
      case "In Game":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };

  const getMoveEmoji = (move) => {
    switch (move) {
      case "rock":
        return "✊";
      case "paper":
        return "✋";
      case "scissors":
        return "✌️";
      default:
        return "❓";
    }
  };

  if (matchFound && matchData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-2xl w-full border-2 border-blue-500/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader className="text-center pb-4">
            <div className="flex justify-between items-center mb-4">
              <Badge className="bg-blue-500 text-white">
                Room: {matchData.roomId}
              </Badge>
              <Button onClick={handleLeaveRoom} variant="destructive" size="sm">
                Leave Room
              </Button>
            </div>
            <CardTitle className="text-3xl text-white">
              {gameResult ? "Round Over!" : "Rock Paper Scissors"}
            </CardTitle>
            <CardDescription className="text-lg text-gray-300">
              {gameResult ? gameResult.message : "Choose your move"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {matchData.players.map((player, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4 text-center">
                    <Avatar className="mx-auto mb-2 w-12 h-12">
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white font-bold">
                        {player.name.slice(0, 2)}
                      </AvatarFallback>
                    </Avatar>
                    <p className="text-white font-medium mb-2">{player.name}</p>
                    {gameResult ? (
                      <div className="text-4xl">
                        {getMoveEmoji(
                          gameResult.moves.find((m) => m.name === player.name)
                            ?.move
                        )}
                      </div>
                    ) : (
                      <Badge
                        className={
                          playerMoved[player.id]
                            ? "bg-green-500"
                            : "bg-gray-500"
                        }
                      >
                        {playerMoved[player.id] ? "Moved" : "Waiting..."}
                      </Badge>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>

            {gameResult && (
              <Card className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 border-purple-500/50">
                <CardContent className="p-6 text-center">
                  <Trophy className="w-12 h-12 text-yellow-400 mx-auto mb-3" />
                  <p className="text-2xl font-bold text-white mb-4">
                    {gameResult.message}
                  </p>
                  <Button
                    onClick={handlePlayAgain}
                    className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                  >
                    Play Again
                  </Button>
                </CardContent>
              </Card>
            )}

            {!gameResult && (
              <div className="grid grid-cols-3 gap-4">
                {["rock", "paper", "scissors"].map((move) => (
                  <Button
                    key={move}
                    onClick={() => handleGameMove(move)}
                    disabled={!!selectedMove}
                    className={`h-24 text-4xl ${
                      selectedMove === move
                        ? "bg-gradient-to-r from-green-500 to-emerald-600"
                        : "bg-slate-700 hover:bg-slate-600"
                    }`}
                  >
                    {getMoveEmoji(move)}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        <Card className="border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                    <Gamepad2 className="w-7 h-7" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-white">Game Lobby</h1>
                  <p className="text-gray-400">
                    Welcome, {_user?.name || "Guest"}
                  </p>
                </div>
              </div>
              <Badge
                variant="outline"
                className="border-green-500 text-green-400 px-4 py-2 text-base"
              >
                <Wifi className="w-5 h-5 mr-2" />
                {onlineCount} Online
              </Badge>
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  {!inQueue ? (
                    <>
                      <div className="mx-auto w-28 h-28 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/50">
                        <Play className="w-14 h-14 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                          Ready to Play?
                        </h2>
                        <p className="text-gray-400 text-lg">
                          Join the queue and get matched with other players
                        </p>
                      </div>
                      <Button
                        onClick={handleJoinQueue}
                        size="lg"
                        className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-lg px-12 py-6 shadow-lg shadow-blue-500/30"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Join Queue
                      </Button>
                    </>
                  ) : (
                    <>
                      <div className="mx-auto w-28 h-28 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-full flex items-center justify-center animate-pulse shadow-lg shadow-orange-500/50">
                        <Clock className="w-14 h-14 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white mb-2">
                          Finding Match...
                        </h2>
                        <p className="text-gray-400 text-lg">
                          Searching for available players
                        </p>
                      </div>
                      <div className="flex justify-center gap-2">
                        <div
                          className="w-3 h-3 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "0ms" }}
                        ></div>
                        <div
                          className="w-3 h-3 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "150ms" }}
                        ></div>
                        <div
                          className="w-3 h-3 bg-white rounded-full animate-bounce"
                          style={{ animationDelay: "300ms" }}
                        ></div>
                      </div>
                      <Button
                        onClick={handleLeaveQueue}
                        size="lg"
                        variant="destructive"
                        className="text-lg px-12 py-6"
                      >
                        <X className="w-5 h-5 mr-2" />
                        Leave Queue
                      </Button>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-3 gap-4">
              <Card className="border-slate-700 bg-slate-800/50">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-400 text-sm mb-2">In Lobby</p>
                  <p className="text-3xl font-bold text-white">
                    {onlineUsers.filter((u) => u.status === "In Lobby").length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-slate-700 bg-slate-800/50">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-400 text-sm mb-2">In Queue</p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {onlineUsers.filter((u) => u.status === "In Queue").length}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-slate-700 bg-slate-800/50">
                <CardContent className="p-6 text-center">
                  <p className="text-gray-400 text-sm mb-2">In Game</p>
                  <p className="text-3xl font-bold text-green-400">
                    {onlineUsers.filter((u) => u.status === "In Game").length}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <MessageCircle className="w-5 h-5" />
                  Global Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="h-64 overflow-y-auto bg-slate-900/50 rounded-lg p-4 space-y-3">
                    {messages.length === 0 && (
                      <p className="text-gray-500 text-center">
                        No messages yet. Start chatting!
                      </p>
                    )}
                    {messages.map((msg, index) => (
                      <div key={msg.id || index} className="text-sm">
                        <span className="font-bold text-blue-400">
                          {msg.username}:{" "}
                        </span>
                        <span className="text-gray-300">{msg.text}</span>
                      </div>
                    ))}

                    <div ref={messagesEndRef} />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type a message..."
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                    <Button
                      onClick={handleSendMessage}
                      className="bg-blue-500 hover:bg-blue-600"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="w-5 h-5" />
                  Online Players
                </CardTitle>
                <CardDescription>Currently active in lobby</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {onlineUsers.length === 0 && (
                    <p className="text-gray-500 text-center py-4">
                      No players online
                    </p>
                  )}
                  {onlineUsers.map((user) => (
                    <Card
                      key={user.id}
                      className="border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-blue-500 text-white font-bold">
                                {user.name.slice(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="text-white font-medium text-sm">
                                {user.name}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <div
                                  className={`w-2 h-2 rounded-full ${getStatusColor(
                                    user.status
                                  )}`}
                                ></div>
                                <span className="text-xs text-gray-400">
                                  {user.status}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MatchmakingLobby;
