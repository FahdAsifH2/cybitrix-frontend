import React, { useState, useEffect } from "react";
import { Users, Play, X, Clock, Gamepad2, Wifi, Trophy } from "lucide-react";
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

const MatchmakingLobby = () => {
  const [onlineCount, setOnlineCount] = useState(0);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [inQueue, setInQueue] = useState(false);
  const [inGame, setInGame] = useState(false);
  const [currentUser, setCurrentUser] = useState({ name: "Player1234" });
  const [matchFound, setMatchFound] = useState(false);
  const [matchData, setMatchData] = useState(null);

  // Simulated socket connection for demo
  useEffect(() => {
    setOnlineCount(12);
    setOnlineUsers([
      { id: "1", name: "Player1234", status: "In Lobby" },
      { id: "2", name: "Player5678", status: "In Queue" },
      { id: "3", name: "Player9012", status: "In Game" },
      { id: "4", name: "Player3456", status: "In Lobby" },
      { id: "5", name: "Player7890", status: "In Game" },
      { id: "6", name: "Player2468", status: "In Lobby" },
    ]);
  }, []);

  const handleJoinQueue = () => {
    setInQueue(true);
    setTimeout(() => {
      setMatchFound(true);
      setMatchData({
        roomId: "room_123456",
        players: [
          { name: "Player1234", status: "In Game" },
          { name: "Player5678", status: "In Game" },
        ],
      });
      setInQueue(false);
    }, 3000);
  };

  const handleLeaveQueue = () => {
    setInQueue(false);
  };

  const getStatusVariant = (status) => {
    switch (status) {
      case "In Lobby":
        return "secondary";
      case "In Queue":
        return "default";
      case "In Game":
        return "default";
      default:
        return "secondary";
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

  if (matchFound && matchData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="max-w-md w-full border-2 border-green-500/50 bg-gradient-to-br from-slate-800 to-slate-900">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Trophy className="w-10 h-10 text-white" />
            </div>
            <CardTitle className="text-3xl text-white">Match Found!</CardTitle>
            <CardDescription className="text-lg text-gray-300">
              Get ready to play
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {matchData.players.map((player, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-bold">
                            {player.name.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-white font-medium">
                          {player.name}
                        </span>
                      </div>
                      <Badge className="bg-green-500 text-white">Ready</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button
              onClick={() => setInGame(true)}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white text-lg py-6"
              size="lg"
            >
              Start Game
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Card */}
        <Card className="border-slate-700 bg-gradient-to-r from-slate-800 to-slate-900">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Avatar className="w-14 h-14">
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                    <Gamepad2 className="w-7 h-7" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h1 className="text-2xl font-bold text-white">Game Lobby</h1>
                  <p className="text-gray-400">Welcome, {currentUser.name}</p>
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
          {/* Main Panel */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-slate-700 bg-gradient-to-br from-slate-800 to-slate-900">
              <CardContent className="p-8">
                <div className="text-center space-y-6">
                  {!inQueue ? (
                    <>
                      <div className="mx-auto w-28 h-28 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/50">
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
                        className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-lg px-12 py-6 shadow-lg shadow-purple-500/30"
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

            {/* Stats Cards */}
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
          </div>

          {/* Online Users Panel */}
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
                  {onlineUsers.map((user) => (
                    <Card
                      key={user.id}
                      className="border-slate-700 bg-slate-800/30 hover:bg-slate-800/50 transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white font-bold">
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
